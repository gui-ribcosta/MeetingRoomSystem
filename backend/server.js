const express = require("express")
const cors = require("cors")
const db = require("./database")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/salas", (req, res) => {

  db.all("SELECT * FROM salas", (err, salas) => {

    if (err) {
      console.error("Erro ao buscar salas:", err)
      return res.status(500).json({ erro: "Erro ao buscar salas" })
    }

    res.json(salas)

  })

})

app.post("/salas", (req, res) => {

  const nomeSala = req.body.nome?.trim()

  if (!nomeSala) {
    return res.status(400).json({ erro: "Informe o nome da sala" })
  }

  console.log("Criando sala:", nomeSala)

  db.run(
    "INSERT INTO salas(nome) VALUES(?)",
    [nomeSala],
    function (err) {

      if (err) {
        return res.status(400).json({
          erro: "Já existe uma sala com esse nome"
        })
      }

      res.json({
        sucesso: "Sala criada com sucesso",
        id: this.lastID
      })

    }
  )

})

app.delete("/salas/:id", (req, res) => {

  const salaId = req.params.id

  console.log("Removendo sala:", salaId)

  db.run("DELETE FROM codigos WHERE sala_id=?", [salaId])

  db.run(
    "DELETE FROM salas WHERE id=?",
    [salaId],
    function (err) {

      if (err) {
        console.error("Erro ao deletar sala:", err)
        return res.status(500).json({ erro: "Erro ao deletar sala" })
      }

      if (this.changes === 0) {
        return res.status(404).json({ erro: "Sala não encontrada" })
      }

      res.json({ sucesso: "Sala removida" })

    }
  )

})

app.get("/salas/:id/codigos", (req, res) => {

  const salaId = req.params.id

  db.all(
    "SELECT * FROM codigos WHERE sala_id=?",
    [salaId],
    (err, participantes) => {

      if (err) {
        console.error("Erro ao buscar participantes:", err)
        return res.status(500).json({ erro: "Erro ao buscar participantes" })
      }

      res.json(participantes)

    }
  )

})

function gerarCodigo() {
  return Math.floor(1000 + Math.random() * 9000)
}

app.post("/salas/:id/codigos", (req, res) => {

  const salaId = req.params.id
  let apelido = req.body.apelido?.trim() || ""

  db.get(
    "SELECT id FROM salas WHERE id=?",
    [salaId],
    (err, sala) => {

      if (!sala) {
        return res.status(404).json({ erro: "Sala não encontrada" })
      }

      db.get(
        "SELECT COUNT(*) as total FROM codigos WHERE sala_id=?",
        [salaId],
        (err, resultado) => {

          if (resultado.total >= 4) {
            return res.status(400).json({
              erro: "Esta sala já atingiu o limite de 4 participantes"
            })
          }

          if (!apelido) {
            apelido = "Convidado " + (resultado.total + 1)
          }

          db.get(
            "SELECT id FROM codigos WHERE sala_id=? AND LOWER(apelido)=LOWER(?)",
            [salaId, apelido],
            (err, apelidoExistente) => {

              if (apelidoExistente) {
                return res.status(400).json({
                  erro: "Já existe um participante com esse apelido"
                })
              }

              const codigo = gerarCodigo()

              db.get(
                "SELECT id FROM codigos WHERE codigo=?",
                [codigo],
                (err, codigoExistente) => {

                  if (codigoExistente) {
                    return res.status(400).json({
                      erro: "Código gerado já existe, tente novamente"
                    })
                  }

                  db.run(
                    "INSERT INTO codigos (sala_id,codigo,apelido) VALUES (?,?,?)",
                    [salaId, codigo, apelido],
                    function (err) {

                      if (err) {
                        console.error("Erro ao criar participante:", err)
                        return res.status(500).json({
                          erro: "Erro ao gerar código"
                        })
                      }

                      res.json({
                        sucesso: "Participante criado",
                        codigo: codigo
                      })

                    }
                  )

                }
              )

            }
          )

        }
      )

    }
  )

})

app.delete("/codigos/:id", (req, res) => {

  const codigoId = req.params.id

  db.run(
    "DELETE FROM codigos WHERE id=?",
    [codigoId],
    function (err) {

      if (err) {
        console.error("Erro ao remover participante:", err)
        return res.status(500).json({
          erro: "Erro ao remover participante"
        })
      }

      if (this.changes === 0) {
        return res.status(404).json({
          erro: "Participante não encontrado"
        })
      }

      res.json({
        sucesso: "Participante removido"
      })

    }
  )

})

app.post("/entrar", (req, res) => {

  const nomeSala = req.body.nomeSala?.trim()
  const codigo = req.body.codigo

  if (!nomeSala || !codigo) {
    return res.status(400).json({
      erro: "Informe nome da sala e código"
    })
  }

  db.get(
    "SELECT * FROM salas WHERE nome=?",
    [nomeSala],
    (err, sala) => {

      if (!sala) {
        return res.status(404).json({
          erro: "Sala não encontrada"
        })
      }

      db.get(
        "SELECT * FROM codigos WHERE sala_id=? AND codigo=?",
        [sala.id, codigo],
        (err, participante) => {

          if (!participante) {
            return res.status(401).json({
              erro: "Código inválido"
            })
          }

          res.json({
            sucesso: `Entrada permitida na sala ${nomeSala}`
          })

        }
      )

    }
  )

})

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})
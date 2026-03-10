const express = require("express")
const cors = require("cors")
const db = require("./database")

const app = express()

app.use(cors())
app.use(express.json())

/* =========================
   LISTAR SALAS
========================= */

app.get("/salas",(req,res)=>{

db.all("SELECT * FROM salas",(err,salas)=>{

if(err){
return res.json({erro:"Erro ao buscar salas"})
}

res.json(salas)

})

})

/* =========================
   CRIAR SALA
========================= */

app.post("/salas",(req,res)=>{

const nome = req.body.nome?.trim()

if(!nome){
return res.json({erro:"Digite o nome da sala"})
}

db.run(
"INSERT INTO salas(nome) VALUES(?)",
[nome],
function(err){

if(err){
return res.json({erro:"Já existe uma sala com esse nome"})
}

res.json({sucesso:"Sala criada com sucesso"})

})

})

/* =========================
   DELETAR SALA
========================= */

app.delete("/salas/:id",(req,res)=>{

const id = req.params.id

db.run("DELETE FROM codigos WHERE sala_id=?",[id])

db.run("DELETE FROM salas WHERE id=?",[id],function(){

if(this.changes === 0){
return res.json({erro:"Sala não encontrada"})
}

res.json({sucesso:"Sala deletada"})

})

})

/* =========================
   LISTAR CÓDIGOS DA SALA
========================= */

app.get("/salas/:id/codigos",(req,res)=>{

const salaId = req.params.id

db.all(
"SELECT * FROM codigos WHERE sala_id=?",
[salaId],
(err,codigos)=>{

if(err){
return res.json({erro:"Erro ao buscar participantes"})
}

res.json(codigos)

})

})

/* =========================
   GERAR CÓDIGO
========================= */

app.post("/salas/:id/codigos",(req,res)=>{

const salaId = req.params.id
let apelido = req.body.apelido?.trim() || ""

/* verificar se sala existe */

db.get(
"SELECT id FROM salas WHERE id=?",
[salaId],
(err,sala)=>{

if(!sala){
return res.json({erro:"Sala não encontrada"})
}

/* verificar limite */

db.get(
"SELECT COUNT(*) as total FROM codigos WHERE sala_id=?",
[salaId],
(err,row)=>{

if(row.total >= 4){
return res.json({erro:"Esta sala já atingiu o máximo de 4 participantes"})
}

if(!apelido){
apelido = "Convidado " + (row.total + 1)
}

/* verificar apelido duplicado */

db.get(
"SELECT id FROM codigos WHERE sala_id=? AND LOWER(apelido)=LOWER(?)",
[salaId,apelido],
(err,existe)=>{

if(existe){
return res.json({erro:"Já existe um participante com esse apelido nesta sala"})
}

/* gerar código de 4 números */

const codigo = Math.floor(1000 + Math.random() * 9000)

/* garantir que código não repete */

db.get(
"SELECT id FROM codigos WHERE codigo=?",
[codigo],
(err,existeCodigo)=>{

if(existeCodigo){
return res.json({erro:"Código gerado já existe, tente novamente"})
}

/* salvar participante */

db.run(
"INSERT INTO codigos (sala_id,codigo,apelido) VALUES (?,?,?)",
[salaId,codigo,apelido],
function(){

res.json({
sucesso:"Participante adicionado",
codigo:codigo
})

}

)

})

})

})

})

})

/* =========================
   DELETAR CÓDIGO
========================= */

app.delete("/codigos/:id",(req,res)=>{

const id = req.params.id

db.run(
"DELETE FROM codigos WHERE id=?",
[id],
function(){

if(this.changes === 0){
return res.json({erro:"Participante não encontrado"})
}

res.json({sucesso:"Participante removido"})

})

})

/* =========================
   ENTRAR NA SALA
========================= */

app.post("/entrar",(req,res)=>{

const nomeSala = req.body.nomeSala?.trim()
const codigo = req.body.codigo

if(!nomeSala || !codigo){
return res.json({erro:"Informe sala e código"})
}

db.get(
"SELECT * FROM salas WHERE nome=?",
[nomeSala],
(err,sala)=>{

if(!sala){
return res.json({erro:"Sala não encontrada"})
}

db.get(
"SELECT * FROM codigos WHERE sala_id=? AND codigo=?",
[sala.id,codigo],
(err,valido)=>{

if(!valido){
return res.json({erro:"Código inválido"})
}

res.json({sucesso:"Entrada permitida na sala "+nomeSala})

})

})

})

/* =========================
   INICIAR SERVIDOR
========================= */

app.listen(3000,()=>{

console.log("Servidor rodando na porta 3000")

})
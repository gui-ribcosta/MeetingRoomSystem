const sqlite3 = require("sqlite3").verbose()
const path = require("path")

const dbPath = path.join(__dirname, "database.db")

const db = new sqlite3.Database(dbPath, (err) => {

  if (err) {
    console.error("Erro ao conectar com o banco:", err.message)
  } else {
    console.log("Banco de dados SQLite conectado")
  }

})

/*TABELA DE SALAS*/

db.run(`
  CREATE TABLE IF NOT EXISTS salas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE NOT NULL
  )
`)

/*TABELA DE CODIGOS (participantes)*/

db.run(`
  CREATE TABLE IF NOT EXISTS codigos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sala_id INTEGER NOT NULL,
    codigo TEXT NOT NULL,
    apelido TEXT,

    FOREIGN KEY (sala_id) REFERENCES salas(id)
  )
`)

module.exports = db
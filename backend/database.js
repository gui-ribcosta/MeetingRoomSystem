const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(__dirname + "/database.db");

/* CRIAR TABELA DE SALAS */

db.run(`
CREATE TABLE IF NOT EXISTS salas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE
)
`)

/* CRIAR TABELA DE CODIGOS */

db.run(`
CREATE TABLE IF NOT EXISTS codigos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sala_id INTEGER,
    codigo TEXT,
    apelido TEXT,
    FOREIGN KEY(sala_id) REFERENCES salas(id)
)
`)

module.exports = db
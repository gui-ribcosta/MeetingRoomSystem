const API = "http://localhost:3000"

let todasSalas = []

/* ================= CRIAR SALA ================= */

async function criarSala(){

const nome = document.getElementById("nomeSala").value.trim()

if(!nome){
alert("Digite o nome da sala")
return
}

const res = await fetch(API+"/salas",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({nome})
})

const data = await res.json()

if(data.erro){
alert(data.erro)
return
}

alert(data.sucesso)

document.getElementById("nomeSala").value=""

carregarSalas()

}

/* ================= CARREGAR SALAS ================= */

async function carregarSalas(){

const res = await fetch(API+"/salas")

const salas = await res.json()

todasSalas = salas

renderSalas(salas)

}

/* ================= DESENHAR SALAS ================= */

function renderSalas(salas){

const lista = document.getElementById("listaSalas")

lista.innerHTML=""

salas.forEach(sala=>{

const card = document.createElement("div")

card.className="room-card"

card.innerHTML=`

<div class="room-header">

<h3>${sala.nome}</h3>

<div class="room-actions">

<button onclick="gerarCodigo(${sala.id})">
➕ Participante
</button>

<button class="danger" onclick="deletarSala(${sala.id})">
🗑
</button>

</div>

</div>

<div id="codigos-${sala.id}" class="codes"></div>

`

lista.appendChild(card)

carregarCodigos(sala.id)

})

}

/* ================= BUSCAR SALA ================= */

function filtrarSalas(){

const termo = document
.getElementById("buscarSala")
.value
.toLowerCase()

const filtradas = todasSalas.filter(sala =>
sala.nome.toLowerCase().includes(termo)
)

renderSalas(filtradas)

}

/* ================= GERAR CODIGO ================= */

async function gerarCodigo(salaId){

let apelido = prompt("Nome do participante (opcional)")

if(!apelido){
apelido=""
}

const res = await fetch(API+"/salas/"+salaId+"/codigos",{

method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({apelido})

})

const data = await res.json()

alert(data.erro || data.sucesso)

carregarCodigos(salaId)

}

/* ================= LISTAR CODIGOS ================= */

async function carregarCodigos(salaId){

const res = await fetch(API+"/salas/"+salaId+"/codigos")

const codigos = await res.json()

const div = document.getElementById("codigos-"+salaId)

div.innerHTML=""

/* contador */

const contador = document.createElement("div")

contador.className="contador"

contador.innerText=`Participantes: ${codigos.length}/4`

div.appendChild(contador)

/* listar participantes */

codigos.forEach(c=>{

const el = document.createElement("div")

el.className="code-card"

el.innerHTML=`

<div class="code-info">

<span class="apelido">👤 ${c.apelido}</span>

<span class="codigo">🔑 ${c.codigo}</span>

</div>

<div class="code-actions">

<button onclick="copiarCodigo('${c.codigo}')">
📋
</button>

<button class="danger" onclick="deletarCodigo(${c.id},${salaId})">
❌
</button>

</div>

`

div.appendChild(el)

})

}

/* ================= COPIAR CODIGO ================= */

function copiarCodigo(codigo){

navigator.clipboard.writeText(codigo)

alert("Código copiado!")

}

/* ================= REMOVER PARTICIPANTE ================= */

async function deletarCodigo(id,salaId){

const confirmar = confirm("Remover este participante?")

if(!confirmar) return

await fetch(API+"/codigos/"+id,{
method:"DELETE"
})

carregarCodigos(salaId)

}

/* ================= REMOVER SALA ================= */

async function deletarSala(id){

const confirmar = confirm("Excluir esta sala?")

if(!confirmar) return

await fetch(API+"/salas/"+id,{
method:"DELETE"
})

carregarSalas()

}

/* ================= ENTRAR NA SALA ================= */

async function entrar(){

const nomeSala = document.getElementById("salaNome").value

const codigo = document.getElementById("codigo").value

if(!nomeSala || !codigo){

alert("Preencha todos os campos")

return

}

const res = await fetch(API+"/entrar",{

method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({nomeSala,codigo})

})

const data = await res.json()

document.getElementById("resultado").innerText =
data.erro || data.sucesso

}

/* ================= NAVEGAÇÃO SIDEBAR ================= */

function scrollToSection(id){

const section = document.getElementById(id)

if(section){

section.scrollIntoView({
behavior:"smooth",
block:"start"
})

}

const sidebar = document.querySelector(".sidebar")
sidebar.classList.remove("active")

}

/* ================= MENU MOBILE ================= */

function toggleMenu() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.classList.toggle("active");
}

document.querySelectorAll(".sidebar nav button").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".sidebar").classList.remove("active");
    });
});

/* ================= INICIAR SISTEMA ================= */

carregarSalas()
const API = "http://localhost:3000"

let todasSalas = []

async function request(url, options = {}) {
  try {
    const res = await fetch(API + url, options)
    return await res.json()
  } catch (err) {
    console.error("Erro na requisição:", err)
    alert("Erro ao conectar com o servidor")
  }
}

async function criarSala() {

  const input = document.getElementById("nomeSala")
  const nome = input.value.trim()

  if (!nome) {
    alert("Digite o nome da sala")
    return
  }

  const data = await request("/salas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome })
  })

  if (data.erro) {
    alert(data.erro)
    return
  }

  alert(data.sucesso)

  input.value = ""

  carregarSalas()
}

async function carregarSalas() {

  const salas = await request("/salas")

  todasSalas = salas

  renderSalas(salas)
}

function renderSalas(salas) {

  const container = document.getElementById("listaSalas")

  container.innerHTML = ""

  salas.forEach(sala => {

    const card = document.createElement("div")
    card.className = "room-card"

    card.innerHTML = `
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

    container.appendChild(card)

    carregarCodigos(sala.id)

  })

}

function filtrarSalas() {

  const termo = document
    .getElementById("buscarSala")
    .value
    .toLowerCase()

  const filtradas = todasSalas.filter(sala =>
    sala.nome.toLowerCase().includes(termo)
  )

  renderSalas(filtradas)

}

async function gerarCodigo(salaId) {

  let apelido = prompt("Nome do participante (opcional)")

  if (!apelido) apelido = ""

  const data = await request(`/salas/${salaId}/codigos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apelido })
  })

  alert(data.erro || data.sucesso)

  carregarCodigos(salaId)

}

async function carregarCodigos(salaId) {

  const codigos = await request(`/salas/${salaId}/codigos`)

  const div = document.getElementById(`codigos-${salaId}`)

  div.innerHTML = ""

  const contador = document.createElement("div")
  contador.className = "contador"
  contador.innerText = `Participantes: ${codigos.length}/4`

  div.appendChild(contador)

  codigos.forEach(c => {

    const el = document.createElement("div")
    el.className = "code-card"

    el.innerHTML = `
      <div class="code-info">

        <span class="apelido">
          👤 ${c.apelido}
        </span>

        <span class="codigo">
          🔑 ${c.codigo}
        </span>

      </div>

      <div class="code-actions">

        <button onclick="copiarCodigo('${c.codigo}')">
          📋
        </button>

        <button class="danger" onclick="deletarCodigo(${c.id}, ${salaId})">
          ❌
        </button>

      </div>
    `

    div.appendChild(el)

  })

}

function copiarCodigo(codigo) {

  navigator.clipboard.writeText(codigo)

  alert("Código copiado!")

}

async function deletarCodigo(id, salaId) {

  const confirmar = confirm("Remover este participante?")

  if (!confirmar) return

  await request(`/codigos/${id}`, {
    method: "DELETE"
  })

  carregarCodigos(salaId)

}

async function deletarSala(id) {

  const confirmar = confirm("Excluir esta sala?")

  if (!confirmar) return

  await request(`/salas/${id}`, {
    method: "DELETE"
  })

  carregarSalas()

}

async function entrar() {

  const nomeSala = document.getElementById("salaNome").value
  const codigo = document.getElementById("codigo").value

  if (!nomeSala || !codigo) {
    alert("Preencha todos os campos")
    return
  }

  const data = await request("/entrar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nomeSala, codigo })
  })

  document.getElementById("resultado").innerText =
    data.erro || data.sucesso

}

function scrollToSection(id) {

  const section = document.getElementById(id)

  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start"
    })
  }

  document.querySelector(".sidebar").classList.remove("active")

}

function toggleMenu() {

  const sidebar = document.querySelector(".sidebar")

  sidebar.classList.toggle("active")

}

document.querySelectorAll(".sidebar nav button").forEach(btn => {

  btn.addEventListener("click", () => {
    document.querySelector(".sidebar").classList.remove("active")
  })

})

carregarSalas()
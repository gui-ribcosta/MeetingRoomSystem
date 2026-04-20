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
    card.className = "room-card collapsed" // Inicia recolhido
    card.id = `room-card-${sala.id}`

    card.innerHTML = `
      <div class="room-header">
        <div class="room-title-area" onclick="toggleSala(${sala.id})" title="Expandir/Recolher participantes">
          <i class="fa-solid fa-chevron-down"></i>
          <h3 id="room-title-${sala.id}">${sala.nome}</h3>
        </div>

        <div class="room-actions">
          <button class="add-participant-btn" onclick="gerarCodigo(${sala.id})" title="Adicionar participante">
            <i class="fa-solid fa-user-plus"></i> Participante
          </button>

          <button class="edit-btn" onclick="editarSala(${sala.id}, '${sala.nome}')" title="Editar nome da sala">
            <i class="fa-solid fa-pen"></i>
          </button>

          <button class="danger" onclick="deletarSala(${sala.id})" title="Excluir sala">
            <i class="fa-solid fa-trash"></i>
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

        <button onclick="copiarCodigo('${c.codigo}')" title="Copiar código de acesso">
          <i class="fa-solid fa-copy"></i>
        </button>

        <button class="danger" onclick="deletarCodigo(${c.id}, ${salaId})" title="Remover participante">
          <i class="fa-solid fa-xmark"></i>
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

async function editarSala(id, nomeAtual) {
  const novoNome = prompt("Digite o novo nome para a sala:", nomeAtual);

  if (!novoNome || novoNome.trim() === "" || novoNome === nomeAtual) {
    return;
  }

  const data = await request(`/salas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome: novoNome })
  });

  if (data.erro) {
    alert(data.erro);
    return;
  }

  alert(data.sucesso);
  carregarSalas();
}

function toggleSala(id) {
  const card = document.getElementById(`room-card-${id}`);
  if (card) {
    card.classList.toggle("collapsed");
  }
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
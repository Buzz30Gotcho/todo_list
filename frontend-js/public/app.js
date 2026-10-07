// Front "vanilla JS" : aucune compilation, aucun framework.
// Le fichier est servi tel quel par nginx (d'où un Dockerfile sans multi-stage).

const API = '/api'

let todos = []
let filter = 'all'
let editingId = null
const removingIds = new Set()

const el = (id) => document.getElementById(id)

async function api(path, options) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`Erreur API (${res.status})`)
  if (res.status === 204) return null
  return res.json()
}

async function refresh() {
  try {
    todos = await api('/todos')
    render()
  } catch (e) {
    el('content').innerHTML =
      '<div class="error">Impossible de contacter l\'API. Le backend est-il démarré ?</div>'
  }
}

function makeButton(label, className, onClick) {
  const b = document.createElement('button')
  b.className = className
  b.textContent = label
  b.onclick = onClick
  return b
}

function renderItem(todo) {
  const li = document.createElement('li')
  li.className =
    'item' +
    (todo.completed ? ' done' : '') +
    (removingIds.has(todo.id) ? ' removing' : '')

  // Mode édition
  if (editingId === todo.id) {
    const zone = document.createElement('div')
    zone.className = 'edit-zone'

    const titleInput = document.createElement('input')
    titleInput.className = 'input'
    titleInput.value = todo.title

    const descInput = document.createElement('input')
    descInput.className = 'input'
    descInput.placeholder = 'Description (optionnel)'
    descInput.value = todo.description || ''

    const actions = document.createElement('div')
    actions.className = 'actions'
    actions.style.opacity = '1'
    actions.append(
      makeButton('Enregistrer', 'btn btn-primary btn-sm', async () => {
        if (!titleInput.value.trim()) return
        await api(`/todos/${todo.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: titleInput.value.trim(),
            description: descInput.value.trim(),
          }),
        })
        editingId = null
        refresh()
      }),
      makeButton('Annuler', 'btn btn-ghost btn-sm', () => {
        editingId = null
        render()
      })
    )

    zone.append(titleInput, descInput, actions)
    li.appendChild(zone)
    return li
  }

  // Mode affichage
  const check = document.createElement('button')
  check.className = 'check'
  check.setAttribute('aria-label', 'Marquer comme terminée')
  check.textContent = todo.completed ? '✓' : ''
  check.onclick = async () => {
    await api(`/todos/${todo.id}`, {
      method: 'PUT',
      body: JSON.stringify({ completed: !todo.completed }),
    })
    refresh()
  }

  const content = document.createElement('div')
  content.className = 'content'
  const titleEl = document.createElement('span')
  titleEl.className = 'item-title'
  titleEl.textContent = todo.title // textContent = pas d'injection HTML
  content.appendChild(titleEl)
  if (todo.description) {
    const descEl = document.createElement('span')
    descEl.className = 'item-desc'
    descEl.textContent = todo.description
    content.appendChild(descEl)
  }

  const actions = document.createElement('div')
  actions.className = 'actions'
  actions.append(
    makeButton('Modifier', 'btn btn-ghost btn-sm', () => {
      editingId = todo.id
      render()
    }),
    makeButton('Supprimer', 'btn btn-danger btn-sm', () => remove(todo.id))
  )

  li.append(check, content, actions)
  return li
}

function render() {
  const total = todos.length
  const doneCount = todos.filter((t) => t.completed).length
  const remaining = total - doneCount

  el('subtitle').textContent =
    total === 0
      ? 'Aucune tâche pour le moment'
      : `${remaining} active${remaining > 1 ? 's' : ''} · ` +
        `${doneCount} terminée${doneCount > 1 ? 's' : ''}`

  const visible = todos.filter((t) => {
    if (filter === 'active') return !t.completed
    if (filter === 'done') return t.completed
    return true
  })

  const content = el('content')
  content.innerHTML = ''

  if (visible.length === 0) {
    const msg =
      filter === 'active'
        ? { emoji: '🎉', text: 'Tout est fait, bravo !' }
        : filter === 'done'
          ? { emoji: '📭', text: 'Aucune tâche terminée' }
          : { emoji: '📝', text: 'Ajoute ta première tâche' }
    const div = document.createElement('div')
    div.className = 'empty'
    const span = document.createElement('span')
    span.className = 'emoji'
    span.textContent = msg.emoji
    div.append(span, document.createTextNode(msg.text))
    content.appendChild(div)
    return
  }

  const ul = document.createElement('ul')
  ul.className = 'list'
  visible.forEach((todo) => ul.appendChild(renderItem(todo)))
  content.appendChild(ul)
}

function remove(id) {
  // Animation de sortie avant la suppression réelle
  removingIds.add(id)
  render()
  setTimeout(async () => {
    await api(`/todos/${id}`, { method: 'DELETE' })
    removingIds.delete(id)
    refresh()
  }, 220)
}

el('addForm').addEventListener('submit', async (e) => {
  e.preventDefault()
  const title = el('titleInput').value.trim()
  if (!title) return
  await api('/todos', {
    method: 'POST',
    body: JSON.stringify({ title, description: '' }),
  })
  el('titleInput').value = ''
  refresh()
})

el('filters').addEventListener('click', (e) => {
  const btn = e.target.closest('.chip')
  if (!btn) return
  filter = btn.dataset.filter
  document
    .querySelectorAll('.chip')
    .forEach((c) => c.classList.toggle('active', c === btn))
  render()
})

refresh()

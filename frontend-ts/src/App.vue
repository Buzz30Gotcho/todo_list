<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getTodos, createTodo, updateTodo, deleteTodo } from './api'
import type { Todo } from './types'

type Filter = 'all' | 'active' | 'done'

const todos = ref<Todo[]>([])
const title = ref('')
const editingId = ref<number | null>(null)
const editTitle = ref('')
const editDesc = ref('')
const filter = ref<Filter>('all')
const removingIds = ref<number[]>([])
const error = ref('')

async function refresh(): Promise<void> {
  try {
    todos.value = await getTodos()
    error.value = ''
  } catch {
    error.value = "Impossible de contacter l'API. Le backend est-il démarré ?"
  }
}

onMounted(refresh)

async function handleAdd(): Promise<void> {
  if (!title.value.trim()) return
  await createTodo({ title: title.value.trim(), description: '' })
  title.value = ''
  void refresh()
}

async function toggle(todo: Todo): Promise<void> {
  await updateTodo(todo.id, { completed: !todo.completed })
  void refresh()
}

function startEdit(todo: Todo): void {
  editingId.value = todo.id
  editTitle.value = todo.title
  editDesc.value = todo.description || ''
}

async function saveEdit(id: number): Promise<void> {
  if (!editTitle.value.trim()) return
  await updateTodo(id, { title: editTitle.value.trim(), description: editDesc.value.trim() })
  editingId.value = null
  void refresh()
}

function remove(id: number): void {
  // Animation de sortie avant la suppression réelle
  removingIds.value = [...removingIds.value, id]
  setTimeout(async () => {
    await deleteTodo(id)
    await refresh()
    removingIds.value = removingIds.value.filter((x) => x !== id)
  }, 220)
}

const total = computed(() => todos.value.length)
const doneCount = computed(() => todos.value.filter((t) => t.completed).length)
const remaining = computed(() => total.value - doneCount.value)

const subtitle = computed(() => {
  if (total.value === 0) return 'Aucune tâche pour le moment'
  const a = `${remaining.value} active${remaining.value > 1 ? 's' : ''}`
  const d = `${doneCount.value} terminée${doneCount.value > 1 ? 's' : ''}`
  return `${a} · ${d}`
})

const visibleTodos = computed(() =>
  todos.value.filter((t) => {
    if (filter.value === 'active') return !t.completed
    if (filter.value === 'done') return t.completed
    return true
  })
)

const emptyMessage = computed(() =>
  filter.value === 'active'
    ? { emoji: '🎉', text: 'Tout est fait, bravo !' }
    : filter.value === 'done'
      ? { emoji: '📭', text: 'Aucune tâche terminée' }
      : { emoji: '📝', text: 'Ajoute ta première tâche' }
)
</script>

<template>
  <div class="app">
    <div class="card">
      <header class="header">
        <h1>Mes tâches</h1>
      </header>
      <p class="subtitle">{{ subtitle }}</p>

      <form class="add-form" @submit.prevent="handleAdd">
        <input
          class="input"
          v-model="title"
          placeholder="Ajouter une tâche…"
          autocomplete="off"
        />
        <button class="btn btn-primary" type="submit">Ajouter</button>
      </form>

      <div class="filters">
        <button class="chip" :class="{ active: filter === 'all' }" @click="filter = 'all'">
          Toutes
        </button>
        <button class="chip" :class="{ active: filter === 'active' }" @click="filter = 'active'">
          Actives
        </button>
        <button class="chip" :class="{ active: filter === 'done' }" @click="filter = 'done'">
          Terminées
        </button>
      </div>

      <div v-if="error" class="error">{{ error }}</div>
      <div v-else-if="visibleTodos.length === 0" class="empty">
        <span class="emoji">{{ emptyMessage.emoji }}</span>
        {{ emptyMessage.text }}
      </div>
      <ul v-else class="list">
        <li
          v-for="todo in visibleTodos"
          :key="todo.id"
          class="item"
          :class="{ done: todo.completed, removing: removingIds.includes(todo.id) }"
        >
          <div v-if="editingId === todo.id" class="edit-zone">
            <input class="input" v-model="editTitle" />
            <input class="input" v-model="editDesc" placeholder="Description (optionnel)" />
            <div class="actions" style="opacity: 1">
              <button class="btn btn-primary btn-sm" @click="saveEdit(todo.id)">
                Enregistrer
              </button>
              <button class="btn btn-ghost btn-sm" @click="editingId = null">Annuler</button>
            </div>
          </div>
          <template v-else>
            <button
              class="check"
              @click="toggle(todo)"
              aria-label="Marquer comme terminée"
            >
              {{ todo.completed ? '✓' : '' }}
            </button>
            <div class="content">
              <span class="item-title">{{ todo.title }}</span>
              <span v-if="todo.description" class="item-desc">{{ todo.description }}</span>
            </div>
            <div class="actions">
              <button class="btn btn-ghost btn-sm" @click="startEdit(todo)">Modifier</button>
              <button class="btn btn-danger btn-sm" @click="remove(todo.id)">Supprimer</button>
            </div>
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>

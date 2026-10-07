<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getTodos, createTodo, updateTodo, deleteTodo } from './api'
import type { Todo } from './types'

type Filter = 'all' | 'active' | 'done'

const todos = ref<Todo[]>([])
const title = ref('')
const description = ref('')
const editingId = ref<number | null>(null)
const editTitle = ref('')
const editDesc = ref('')
const filter = ref<Filter>('all')
const removingIds = ref<number[]>([])
const loading = ref(true)
const error = ref('')

async function refresh(): Promise<void> {
  try {
    loading.value = true
    todos.value = await getTodos()
    error.value = ''
  } catch {
    error.value = "Impossible de contacter l'API. Le backend est-il démarré ?"
  } finally {
    loading.value = false
  }
}

onMounted(refresh)

async function handleAdd(): Promise<void> {
  if (!title.value.trim()) return
  await createTodo({ title: title.value.trim(), description: description.value.trim() })
  title.value = ''
  description.value = ''
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
  // Lance l'animation de sortie avant la suppression réelle
  removingIds.value = [...removingIds.value, id]
  setTimeout(async () => {
    await deleteTodo(id)
    await refresh()
    removingIds.value = removingIds.value.filter((x) => x !== id)
  }, 280)
}

const total = computed(() => todos.value.length)
const doneCount = computed(() => todos.value.filter((t) => t.completed).length)
const remaining = computed(() => total.value - doneCount.value)
const progress = computed(() =>
  total.value === 0 ? 0 : Math.round((doneCount.value / total.value) * 100)
)

const visibleTodos = computed(() =>
  todos.value.filter((t) => {
    if (filter.value === 'active') return !t.completed
    if (filter.value === 'done') return t.completed
    return true
  })
)

const emptyMessage = computed(() =>
  filter.value === 'active'
    ? { emoji: '🎉', text: 'Rien en cours, tout est fait !' }
    : filter.value === 'done'
      ? { emoji: '🫥', text: 'Aucune tâche terminée pour le moment' }
      : { emoji: '✨', text: 'Aucune tâche — ajoute la première !' }
)
</script>

<template>
  <div class="app">
    <div class="card">
      <header class="header">
        <h1>Todo<span class="accent">List</span></h1>
        <span class="badge">Vue · TypeScript</span>
      </header>
      <p class="subtitle">
        <b>{{ doneCount }}</b> / {{ total }} terminée{{ total > 1 ? 's' : '' }} ·
        <b>{{ remaining }}</b> en cours
      </p>
      <div class="progress">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>

      <form class="add-form" @submit.prevent="handleAdd">
        <input class="input" placeholder="Nouvelle tâche…" v-model="title" />
        <input class="input" placeholder="Description (optionnel)" v-model="description" />
        <button class="btn btn-primary" type="submit">Ajouter</button>
      </form>

      <div class="filters">
        <button class="chip" :class="{ active: filter === 'all' }" @click="filter = 'all'">
          Toutes <span class="count">{{ total }}</span>
        </button>
        <button class="chip" :class="{ active: filter === 'active' }" @click="filter = 'active'">
          En cours <span class="count">{{ remaining }}</span>
        </button>
        <button class="chip" :class="{ active: filter === 'done' }" @click="filter = 'done'">
          Terminées <span class="count">{{ doneCount }}</span>
        </button>
      </div>

      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="loading" class="empty">Chargement…</div>
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
            <input class="input" v-model="editDesc" />
            <div class="actions">
              <button class="btn btn-primary" @click="saveEdit(todo.id)">Enregistrer</button>
              <button class="btn btn-ghost" @click="editingId = null">Annuler</button>
            </div>
          </div>
          <template v-else>
            <button class="check" @click="toggle(todo)" aria-label="Terminer">
              {{ todo.completed ? '✓' : '' }}
            </button>
            <div class="content">
              <span class="item-title">{{ todo.title }}</span>
              <span v-if="todo.description" class="item-desc">{{ todo.description }}</span>
            </div>
            <div class="actions">
              <button class="btn btn-ghost" @click="startEdit(todo)">Modifier</button>
              <button class="btn btn-danger" @click="remove(todo.id)">Supprimer</button>
            </div>
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>

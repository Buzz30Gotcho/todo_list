import type { Todo, TodoInput } from './types'

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T | null> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`Erreur API (${res.status})`)
  }
  if (res.status === 204) return null
  return (await res.json()) as T
}

export const getTodos = () => request<Todo[]>('/todos') as Promise<Todo[]>

export const createTodo = (data: TodoInput) =>
  request<Todo>('/todos', { method: 'POST', body: JSON.stringify(data) })

export const updateTodo = (id: number, data: TodoInput) =>
  request<Todo>(`/todos/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteTodo = (id: number) =>
  request<null>(`/todos/${id}`, { method: 'DELETE' })

export interface Todo {
  id: number
  title: string
  description: string
  completed: boolean
  created_at: string
}

export interface TodoInput {
  title?: string
  description?: string
  completed?: boolean
}

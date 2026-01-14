export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: number
}

export type FilterType = 'all' | 'active' | 'completed'

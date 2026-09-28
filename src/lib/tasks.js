import { daysFromToday, isDueToday, isOverdue } from './dates'

export const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export const STATUSES = [
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
]

export const PRIORITY_RANK = { high: 0, medium: 1, low: 2 }
export const STATUS_RANK = { 'in-progress': 0, todo: 1, completed: 2 }

export const VIEWS = [
  { value: 'all', label: 'All tasks' },
  { value: 'today', label: 'Today' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'completed', label: 'Completed' },
]

export const SORTS = [
  { value: 'due', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'created', label: 'Created date' },
  { value: 'az', label: 'A to Z' },
]

export const priorityLabel = (value) =>
  PRIORITIES.find((p) => p.value === value)?.label ?? value

export const statusLabel = (value) => STATUSES.find((s) => s.value === value)?.label ?? value

export const newId = (prefix) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

/** The five dashboard numbers, computed from the full task list. */
export function getCounts(tasks) {
  return tasks.reduce(
    (acc, task) => {
      acc.all += 1
      if (task.status === 'completed') {
        acc.completed += 1
        return acc
      }
      if (task.status === 'in-progress') acc.inProgress += 1
      if (isDueToday(task)) acc.dueToday += 1
      if (isOverdue(task)) acc.overdue += 1
      return acc
    },
    { all: 0, dueToday: 0, inProgress: 0, completed: 0, overdue: 0 },
  )
}

export function countByProject(tasks, projectId) {
  return tasks.reduce((n, task) => (task.projectId === projectId ? n + 1 : n), 0)
}

/** Which of the five views a task belongs to. */
export function matchesView(task, view) {
  const diff = daysFromToday(task.dueDate)
  switch (view) {
    case 'today':
      return task.status !== 'completed' && diff === 0
    case 'upcoming':
      return task.status !== 'completed' && diff !== null && diff > 0
    case 'overdue':
      return task.status !== 'completed' && diff !== null && diff < 0
    case 'completed':
      return task.status === 'completed'
    default:
      return true
  }
}

export const countForView = (tasks, view) =>
  tasks.reduce((n, task) => (matchesView(task, view) ? n + 1 : n), 0)

/** View + filters + search, in that order. */
export function filterTasks(tasks, { view, projectId, priority, status, search }) {
  const query = search.trim().toLowerCase()
  return tasks.filter((task) => {
    if (!matchesView(task, view)) return false
    if (projectId === 'unassigned' && task.projectId) return false
    if (projectId && projectId !== 'unassigned' && task.projectId !== projectId) return false
    if (priority !== 'all' && task.priority !== priority) return false
    if (status !== 'all' && task.status !== status) return false
    if (query) {
      const haystack = `${task.title} ${task.description}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }
    return true
  })
}

/** Sorts a copy. Tasks without a due date always sink to the bottom. */
export function sortTasks(tasks, sort) {
  const sorted = [...tasks]
  const byDue = (a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0
  }

  switch (sort) {
    case 'priority':
      sorted.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || byDue(a, b))
      break
    case 'created':
      sorted.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
      break
    case 'az':
      sorted.sort((a, b) => a.title.localeCompare(b.title))
      break
    default:
      sorted.sort(
        (a, b) =>
          byDue(a, b) ||
          STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
          PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
      )
  }
  return sorted
}

/** Projects carrying at least one task, ordered by task count then name. */
export function rankProjects(projects, tasks) {
  return projects
    .map((project) => ({ ...project, count: countByProject(tasks, project.id) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

import { createSeedData } from './seed'

const KEYS = {
  tasks: 'taskmanager.tasks',
  projects: 'taskmanager.projects',
  theme: 'taskmanager.theme',
}

const canPersist = (() => {
  try {
    const probe = '__tm_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
})()

export const persistenceAvailable = canPersist

function read(key, fallback) {
  if (!canPersist) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  if (!canPersist) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota exceeded or blocked — the app keeps working in memory */
  }
}

/** Shape-checked read so a stale or hand-edited payload can't crash the app. */
function readCollection(key, required) {
  const value = read(key, null)
  if (!Array.isArray(value)) return null
  const valid = value.filter(
    (item) => item && typeof item === 'object' && typeof item.id === 'string',
  )
  return valid.every((item) => required.every((field) => field in item)) ? valid : null
}

export const loadState = () => {
  const projects = readCollection(KEYS.projects, ['name', 'createdAt'])
  const tasks = readCollection(KEYS.tasks, ['title', 'priority', 'status'])
  if (projects && tasks) return { projects, tasks }
  return createSeedData()
}

export const saveTasks = (tasks) => write(KEYS.tasks, tasks)
export const saveProjects = (projects) => write(KEYS.projects, projects)

export function loadTheme() {
  if (!canPersist) return null
  const stored = window.localStorage.getItem(KEYS.theme)
  return stored === 'light' || stored === 'dark' ? stored : null
}

export function saveTheme(theme) {
  if (!canPersist) return
  try {
    window.localStorage.setItem(KEYS.theme, theme)
  } catch {
    /* ignore */
  }
}

/** Restores the seed data and drops every stored change. */
export const resetToSeed = () => {
  const seed = createSeedData()
  write(KEYS.tasks, seed.tasks)
  write(KEYS.projects, seed.projects)
  return seed
}

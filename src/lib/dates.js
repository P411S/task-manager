/**
 * Date helpers.
 *
 * Due dates are stored as plain `YYYY-MM-DD` strings so they are never shifted
 * by the browser's timezone. "Today" is therefore the user's local calendar day.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** Local calendar day as `YYYY-MM-DD` (never UTC-shifted). */
export function toDateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayKey() {
  return toDateKey(new Date())
}

/** `YYYY-MM-DD` for the day `offset` days from today (negative = past). */
export function dayOffsetKey(offset) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return toDateKey(d)
}

/** Parse `YYYY-MM-DD` into a local Date at midnight. */
function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Whole days from today to `key`. Negative = in the past. */
export function daysFromToday(key) {
  if (!key) return null
  const then = parseKey(key)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((then - today) / MS_PER_DAY)
}

export const isOverdue = (task) =>
  task.status !== 'completed' && daysFromToday(task.dueDate) !== null && daysFromToday(task.dueDate) < 0

export const isDueToday = (task) =>
  task.status !== 'completed' && task.dueDate === todayKey()

/** "Today", "Tomorrow", "Yesterday", "Mon 3 Feb" or "No due date". */
export function formatDueDate(key) {
  if (!key) return null
  const diff = daysFromToday(key)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff !== null && diff > 1 && diff < 7) {
    return parseKey(key).toLocaleDateString(undefined, { weekday: 'long' })
  }
  if (diff !== null && diff < -1 && diff > -7) {
    return `${Math.abs(diff)} days ago`
  }
  const date = parseKey(key)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: sameYear ? undefined : 'numeric',
  })
}

export function formatCreatedAt(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

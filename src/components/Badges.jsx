import Icon from './Icon'
import { isOverdue } from '../lib/dates'
import { priorityLabel, statusLabel } from '../lib/tasks'

const PRIORITY_TONES = {
  high: 'bg-danger-soft text-danger',
  medium: 'bg-warning-soft text-warning',
  low: 'bg-surface-2 text-fg-muted',
}

const PRIORITY_DOTS = {
  high: 'bg-danger',
  medium: 'bg-warning',
  low: 'bg-fg-faint',
}

const STATUS_TONES = {
  todo: 'bg-surface-2 text-fg-muted',
  'in-progress': 'bg-accent-soft text-accent',
  completed: 'bg-success-soft text-success',
}

export function PriorityBadge({ priority, showLabel = true }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px]
        font-semibold tracking-wide uppercase ${PRIORITY_TONES[priority]}`}
    >
      <span className={`size-1.5 rounded-full ${PRIORITY_DOTS[priority]}`} aria-hidden="true" />
      {showLabel ? priorityLabel(priority) : <span className="sr-only">{priorityLabel(priority)}</span>}
    </span>
  )
}

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px]
        font-semibold ${STATUS_TONES[status]}`}
    >
      {status === 'completed' && <Icon name="check" className="size-3" />}
      {statusLabel(status)}
    </span>
  )
}

export function ProjectTag({ project }) {
  if (!project) {
    return (
      <span className="text-fg-faint inline-flex items-center gap-1.5 text-xs">
        <Icon name="inbox" className="size-3.5" />
        No project
      </span>
    )
  }
  return (
    <span className="text-fg-muted inline-flex items-center gap-1.5 text-xs font-medium">
      <span className={`size-2 rounded-full ${project.color ?? 'bg-fg-faint'}`} aria-hidden="true" />
      {project.name}
    </span>
  )
}

export function DueTag({ task, format }) {
  if (!task.dueDate) return null
  const overdue = isOverdue(task)
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap
        ${overdue ? 'text-danger' : 'text-fg-muted'}`}
    >
      <Icon name={overdue ? 'alert' : 'calendar'} className="size-3.5" />
      {format(task.dueDate)}
      {overdue && <span className="sr-only">(overdue)</span>}
    </span>
  )
}

import { memo } from 'react'
import Icon from './Icon'
import { DueTag, PriorityBadge, ProjectTag, StatusBadge } from './Badges'
import { formatDueDate, isOverdue } from '../lib/dates'

/**
 * One task row.
 *
 * The title is a real button whose ::after overlay covers the whole row, so the
 * row is clickable with a mouse while the checkbox stays a separate, valid
 * control for keyboard and screen-reader users.
 */
function TaskItem({ task, project, onOpen, onToggle, isActive, tabIndex, onKeyDown, ref }) {
  const done = task.status === 'completed'
  const overdue = isOverdue(task)

  return (
    <li
      className={[
        'group border-line relative border-b transition-colors last:border-b-0',
        done ? 'opacity-60' : '',
        overdue ? 'bg-danger-soft/35' : 'hover:bg-surface-2/60',
        isActive ? 'bg-surface-2' : '',
      ].join(' ')}
    >
      {/* Overdue tasks carry a standing left edge so they read at a glance. */}
      {overdue && (
        <span className="bg-danger absolute inset-y-0 left-0 w-0.5" aria-hidden="true" />
      )}

      <div className="flex items-start gap-3 py-3.5 pr-4 pl-4 sm:gap-4 sm:pl-5">
        <label className="relative z-10 mt-0.5 flex size-5 shrink-0 cursor-pointer items-center">
          <input
            type="checkbox"
            checked={done}
            onChange={() => onToggle(task.id)}
            className="peer sr-only"
          />
          <span
            className={`flex size-5 items-center justify-center rounded-md border
              transition-colors peer-focus-visible:ring-accent/40 peer-focus-visible:ring-2
              peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--surface)]
              ${
                done
                  ? 'border-accent bg-accent text-accent-fg'
                  : task.status === 'in-progress'
                    ? 'border-accent text-accent'
                    : 'border-line-strong hover:border-accent'
              }`}
            aria-hidden="true"
          >
            {done ? (
              <Icon name="check" className="size-3.5" strokeWidth="2.5" />
            ) : task.status === 'in-progress' ? (
              <Icon name="minus" className="size-3.5" strokeWidth="2.5" />
            ) : null}
          </span>
          <span className="sr-only">
            {done ? 'Reopen' : 'Complete'} “{task.title}”
          </span>
        </label>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            ref={ref}
            onClick={() => onOpen(task.id)}
            tabIndex={tabIndex}
            onKeyDown={onKeyDown}
            aria-label={`Open task “${task.title}”`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none
              text-left"
          >
            <span
              className={`block truncate text-sm font-medium ${
                done ? 'text-fg-muted line-through' : overdue ? 'text-fg' : 'text-fg'
              }`}
            >
              {task.title}
            </span>
          </button>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {project ? (
              <ProjectTag project={project} />
            ) : (
              <ProjectTag project={null} />
            )}
            {task.status !== 'todo' && <StatusBadge status={task.status} />}
            <DueTag task={task} format={formatDueDate} />
            <span className="ml-auto">
              <PriorityBadge priority={task.priority} />
            </span>
          </div>
        </div>
      </div>
    </li>
  )
}

export default memo(TaskItem)

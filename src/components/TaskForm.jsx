import { useRef } from 'react'
import Icon from './Icon'
import { PRIORITIES, STATUSES } from '../lib/tasks'
import { todayKey } from '../lib/dates'

/**
 * Radio group styled as a segmented control, with roving tabindex and arrow
 * key navigation as the ARIA radio pattern expects.
 */
export function Segmented({ label, value, onChange, options }) {
  const refs = useRef([])

  const move = (delta) => {
    const index = options.findIndex((option) => option.value === value)
    const next = (index + delta + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      move(1)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      move(-1)
    }
  }

  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div
        role="radiogroup"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="border-line bg-surface-2 grid grid-cols-3 gap-1 rounded-lg border p-1"
      >
        {options.map((option, index) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              ref={(node) => {
                refs.current[index] = node
              }}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(option.value)}
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-2
                py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-surface text-fg shadow-sm'
                    : 'text-fg-muted hover:text-fg'
                }`}
            >
              {option.dot && (
                <span className={`size-1.5 rounded-full ${option.dot}`} aria-hidden="true" />
              )}
              {option.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

const PRIORITY_OPTIONS = PRIORITIES.map((item) => ({
  ...item,
  dot: { low: 'bg-fg-faint', medium: 'bg-warning', high: 'bg-danger' }[item.value],
}))

export const STATUS_OPTIONS = STATUSES

/** The shared task fields used by both the create dialog and the detail view. */
export default function TaskForm({ draft, onChange, projects, onSubmit, submitRef, children }) {
  const set = (patch) => onChange({ ...draft, ...patch })

  const onKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      onSubmit()
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      onKeyDown={onKeyDown}
      className="flex flex-col gap-4"
    >
      <div>
        <label className="label" htmlFor="task-title">
          Title
        </label>
        <input
          id="task-title"
          ref={submitRef}
          value={draft.title}
          onChange={(event) => set({ title: event.target.value })}
          placeholder="What needs to be done?"
          required
          maxLength={140}
          autoComplete="off"
          className="field"
        />
      </div>

      <div>
        <label className="label" htmlFor="task-description">
          Description <span className="text-fg-faint font-normal">(optional)</span>
        </label>
        <textarea
          id="task-description"
          value={draft.description}
          onChange={(event) => set({ description: event.target.value })}
          rows={4}
          placeholder="Add any detail that helps you finish this."
          className="field resize-y"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="task-due">
            Due date <span className="text-fg-faint font-normal">(optional)</span>
          </label>
          <div className="relative">
            <input
              id="task-due"
              type="date"
              value={draft.dueDate ?? ''}
              onChange={(event) => set({ dueDate: event.target.value })}
              className="field pr-8"
            />
            {draft.dueDate && (
              <button
                type="button"
                onClick={() => set({ dueDate: null })}
                aria-label="Clear due date"
                className="text-fg-faint hover:text-fg absolute top-1/2 right-2
                  -translate-y-1/2 cursor-pointer rounded-md p-1 transition-colors"
              >
                <Icon name="x" className="size-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => set({ dueDate: todayKey() })}
            className="text-fg-muted hover:text-fg mt-1.5 cursor-pointer text-xs font-medium
              transition-colors"
          >
            Due today
          </button>
        </div>

        <div>
          <label className="label" htmlFor="task-project">
            Project <span className="text-fg-faint font-normal">(optional)</span>
          </label>
          <div className="relative">
            <select
              id="task-project"
              value={draft.projectId ?? ''}
              onChange={(event) => set({ projectId: event.target.value || null })}
              className="field cursor-pointer appearance-none pr-8"
            >
              <option value="">No project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <Icon
              name="chevronDown"
              className="text-fg-faint pointer-events-none absolute top-1/2 right-2.5 size-4
                -translate-y-1/2"
            />
          </div>
        </div>
      </div>

      <Segmented
        label="Priority"
        value={draft.priority}
        onChange={(priority) => set({ priority })}
        options={PRIORITY_OPTIONS}
      />

      <Segmented
        label="Status"
        value={draft.status}
        onChange={(status) => set({ status })}
        options={STATUS_OPTIONS}
      />

      {children}
    </form>
  )
}

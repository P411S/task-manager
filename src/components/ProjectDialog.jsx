import { useRef, useState } from 'react'
import Modal from './Modal'
import Icon from './Icon'
import ConfirmDialog from './ConfirmDialog'
import { useData } from '../context/DataContext'
import { PROJECT_COLORS } from '../lib/seed'

const fallbackColor = 'bg-slate-500'

function ColorPicker({ value, onChange }) {
  return (
    <fieldset>
      <legend className="label">Colour</legend>
      <div className="flex flex-wrap gap-2">
        {PROJECT_COLORS.map((color) => {
          const active = color.className === value
          return (
            <button
              key={color.name}
              type="button"
              onClick={() => onChange(color.className)}
              aria-label={color.name}
              aria-pressed={active}
              className={`flex size-8 cursor-pointer items-center justify-center rounded-full
                ${color.className} transition-transform ${
                  active ? 'ring-accent ring-2 ring-offset-2 ring-offset-[var(--surface)]' : ''
                } hover:scale-105`}
            >
              {active && <Icon name="check" className="size-4 text-white" strokeWidth="3" />}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Create or rename a project; in manage mode it can also delete one. */
export default function ProjectDialog({ project, onClose, onDeleted }) {
  const { projects, addProject, updateProject, deleteProject, rankedProjects } = useData()
  const [name, setName] = useState(project?.name ?? '')
  const [color, setColor] = useState(project?.color ?? fallbackColor)
  const [confirming, setConfirming] = useState(false)
  const [deleteTasks, setDeleteTasks] = useState(false)
  const nameRef = useRef(null)

  const editing = Boolean(project)
  const taskCount = project ? (rankedProjects.find((p) => p.id === project.id)?.count ?? 0) : 0
  const trimmed = name.trim()
  const taken = projects.some(
    (item) => item.name.toLowerCase() === trimmed.toLowerCase() && item.id !== project?.id,
  )

  const submit = () => {
    if (!trimmed || taken) return
    if (editing) {
      updateProject(project.id, { name: trimmed, color })
    } else {
      addProject(trimmed, color)
    }
    onClose()
  }

  return (
    <>
      <Modal
        open={!confirming}
        onClose={onClose}
        size="sm"
        title={editing ? 'Project settings' : 'New project'}
        description={
          editing ? `${taskCount} ${taskCount === 1 ? 'task' : 'tasks'} in this project.` : undefined
        }
        labelledBy="project-dialog-title"
        initialFocusRef={nameRef}
        footer={
          <>
            {editing && (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="btn-danger-outline mr-auto"
              >
                <Icon name="trash" className="size-4" />
                Delete
              </button>
            )}
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              form="project-form"
              disabled={!trimmed || taken}
              className="btn-primary"
            >
              {editing ? 'Save changes' : 'Create project'}
            </button>
          </>
        }
      >
        <form
          id="project-form"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
          className="flex flex-col gap-4 pt-5"
        >
          <div>
            <label className="label" htmlFor="project-name">
              Name
            </label>
            <input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Design System"
              required
              maxLength={60}
              autoComplete="off"
              className="field"
            />
            {taken && (
              <p className="text-danger mt-1.5 text-xs">A project with that name already exists.</p>
            )}
          </div>
          <ColorPicker value={color} onChange={setColor} />
        </form>
      </Modal>

      {editing && (
        <ConfirmDialog
          open={confirming}
          title={`Delete “${project.name}”?`}
          message={
            taskCount > 0
              ? `This project has ${taskCount} ${taskCount === 1 ? 'task' : 'tasks'}. Choose what happens to ${taskCount === 1 ? 'it' : 'them'}.`
              : 'This project is empty, so nothing else will change.'
          }
          confirmLabel="Delete project"
          secondary={
            taskCount > 0
              ? {
                  checked: deleteTasks,
                  onChange: (event) => setDeleteTasks(event.target.checked),
                  label: `Delete the ${taskCount} ${taskCount === 1 ? 'task' : 'tasks'} too`,
                  hint: 'Leave unchecked to move them to “No project”.',
                }
              : undefined
          }
          onCancel={() => setConfirming(false)}
          onConfirm={() => {
            setConfirming(false)
            deleteProject(project.id, deleteTasks ? 'delete-tasks' : 'unassign')
            onDeleted?.()
            onClose()
          }}
        />
      )}
    </>
  )
}

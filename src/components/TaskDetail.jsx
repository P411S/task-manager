import { useEffect, useRef, useState } from 'react'
import Modal from './Modal'
import Icon from './Icon'
import TaskForm from './TaskForm'
import ConfirmDialog from './ConfirmDialog'
import { DueTag, PriorityBadge, ProjectTag } from './Badges'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import { formatCreatedAt, formatDueDate } from '../lib/dates'

const toDraft = (task) => ({
  title: task.title,
  description: task.description,
  dueDate: task.dueDate,
  priority: task.priority,
  status: task.status,
  projectId: task.projectId,
})

/** Detail and edit view for a single task. Keyed by task id by the caller. */
export default function TaskDetail({ taskId, onClose, onDeleted }) {
  const { tasks, projects, getProject, updateTask, deleteTask, toggleTask } = useData()
  const { notify } = useToast()
  const task = tasks.find((item) => item.id === taskId) ?? null
  // The draft is seeded once per task id (the caller remounts on change) so
  // edits to this task from elsewhere never discard in-progress changes.
  const [draft, setDraft] = useState(() => (task ? toDraft(task) : null))
  const [confirming, setConfirming] = useState(false)
  const titleRef = useRef(null)

  // The task can disappear underneath us (e.g. deleted from another view).
  useEffect(() => {
    if (taskId && !task) onClose()
  }, [taskId, task, onClose])

  useEffect(() => {
    if (!confirming) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setConfirming(false)
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [confirming])

  if (!task || !draft) return null

  const project = getProject(task.projectId)
  const dirty = JSON.stringify(draft) !== JSON.stringify(toDraft(task))
  const done = task.status === 'completed'

  const save = () => {
    if (!draft.title.trim()) return
    updateTask(task.id, draft)
    notify('Task updated', { tone: 'success' })
    onClose()
  }

  return (
    <>
      <Modal
        open={!confirming}
        onClose={onClose}
        variant="drawer"
        size="md"
        labelledBy="task-detail-title"
        initialFocusRef={titleRef}
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="btn-danger-outline mr-auto"
            >
              <Icon name="trash" className="size-4" />
              Delete
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="button" onClick={save} disabled={!draft.title.trim() || !dirty} className="btn-primary">
              Save changes
            </button>
          </>
        }
      >
        <h2 id="task-detail-title" className="sr-only">
          Task details
        </h2>

        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <PriorityBadge priority={task.priority} />
          <ProjectTag project={project} />
          <DueTag task={task} format={formatDueDate} />
        </div>

        <TaskForm draft={draft} onChange={setDraft} projects={projects} onSubmit={save} submitRef={titleRef}>
          <div className="border-line bg-surface-2/60 -mt-1 flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
            <div className="text-fg-faint flex flex-col gap-0.5 text-xs">
              <span>Created {formatCreatedAt(task.createdAt)}</span>
              {task.completedAt && (
                <span className="text-success">
                  Completed {formatCreatedAt(task.completedAt)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => toggleTask(task.id)}
              className={done ? 'btn-outline' : 'btn-primary'}
            >
              <Icon name={done ? 'rotate' : 'check'} className="size-4" strokeWidth="2.25" />
              {done ? 'Reopen task' : 'Mark complete'}
            </button>
          </div>
        </TaskForm>
      </Modal>

      <ConfirmDialog
        open={confirming}
        title="Delete this task?"
        message={`“${task.title}” will be removed permanently. This cannot be undone.`}
        confirmLabel="Delete task"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false)
          deleteTask(task.id)
          onDeleted?.()
          onClose()
        }}
      />
    </>
  )
}

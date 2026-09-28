import { useEffect, useRef, useState } from 'react'
import Modal from './Modal'
import TaskForm from './TaskForm'
import { useData } from '../context/DataContext'

const emptyDraft = { title: '', description: '', dueDate: null, priority: 'medium', status: 'todo', projectId: null }

/** Quick capture: a task in seconds, with everything else optional. */
export default function TaskDialog({ open, onClose, defaultProjectId = null }) {
  const { addTask, projects } = useData()
  const [draft, setDraft] = useState(emptyDraft)
  const titleRef = useRef(null)

  useEffect(() => {
    if (open) setDraft({ ...emptyDraft, projectId: defaultProjectId })
  }, [open, defaultProjectId])

  const submit = () => {
    if (!draft.title.trim()) {
      titleRef.current?.focus()
      return
    }
    addTask(draft)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New task"
      description="Capture it now, refine it later."
      initialFocusRef={titleRef}
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button type="button" onClick={submit} className="btn-primary">
            Create task
          </button>
        </>
      }
    >
      <TaskForm
        draft={draft}
        onChange={setDraft}
        projects={projects}
        onSubmit={submit}
        submitRef={titleRef}
      >
        <p className="text-fg-faint -mt-1 text-xs">
          Press <kbd className="border-line rounded border px-1">Ctrl</kbd>
          <span className="px-0.5">+</span>
          <kbd className="border-line rounded border px-1">Enter</kbd> to create.
        </p>
      </TaskForm>
    </Modal>
  )
}

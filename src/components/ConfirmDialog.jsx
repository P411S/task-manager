import Modal from './Modal'
import Icon from './Icon'

/**
 * Deleting always asks first.
 * `secondary` adds a third path — used when deleting a project must also decide
 * what happens to the tasks inside it.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  icon = 'alert',
  secondary,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={open} onClose={onCancel} size="sm" labelledBy="confirm-title">
      <div className="flex gap-4 pt-5">
        <span
          className="bg-danger-soft text-danger flex size-9 shrink-0 items-center justify-center
            rounded-full"
        >
          <Icon name={icon} className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="confirm-title" className="text-base font-semibold tracking-tight">
            {title}
          </h2>
          {message && <p className="text-fg-muted mt-1.5 text-sm">{message}</p>}
        </div>
      </div>

      {secondary && (
        <label
          className="border-line hover:border-line-strong hover:bg-surface-2 mt-4 flex cursor-pointer
            items-start gap-3 rounded-lg border p-3 transition-colors"
        >
          <input
            type="checkbox"
            checked={secondary.checked}
            onChange={secondary.onChange}
            className="accent-danger mt-0.5 size-4 shrink-0"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium">{secondary.label}</span>
            <span className="text-fg-muted block text-xs">{secondary.hint}</span>
          </span>
        </label>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-outline">
          {cancelLabel}
        </button>
        <button type="button" onClick={onConfirm} className="btn-danger">
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

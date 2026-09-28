import Icon from './Icon'

/** Explains what to do when a list has nothing in it. */
export default function EmptyState({ icon = 'inbox', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span
        className="bg-surface-2 text-fg-faint mb-4 flex size-11 items-center justify-center
          rounded-full"
      >
        <Icon name={icon} className="size-5" />
      </span>
      <h3 className="text-sm font-semibold">{title}</h3>
      {message && <p className="text-fg-muted mt-1.5 max-w-xs text-sm">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import Icon from '../components/Icon'

const ToastContext = createContext(null)

const TONE_STYLES = {
  success: 'border-success/40 bg-success-soft text-fg',
  danger: 'border-danger/40 bg-danger-soft text-fg',
  info: 'border-line bg-surface text-fg',
}

const TONE_ICONS = {
  success: 'check',
  danger: 'trash',
  info: 'info',
}

let nextId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const notify = useCallback(
    (message, { tone = 'info', duration = 3200 } = {}) => {
      const id = nextId++
      setToasts((current) => [...current.slice(-2), { id, message, tone }])
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      )
      return id
    },
    [dismiss],
  )

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Polite so screen readers announce feedback after the action. */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-100 flex flex-col
          items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-pop-in pointer-events-auto flex w-full max-w-sm items-start
              gap-3 rounded-xl border px-4 py-3 shadow-lg ${TONE_STYLES[toast.tone]}`}
          >
            <span className="mt-0.5 shrink-0">
              <Icon
                name={TONE_ICONS[toast.tone]}
                className={[
                  'size-4',
                  toast.tone === 'success' ? 'text-success' : '',
                  toast.tone === 'danger' ? 'text-danger' : 'text-fg-muted',
                ].join(' ')}
              />
            </span>
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="-m-1 cursor-pointer rounded-md p-1 text-fg-faint transition-colors
                hover:text-fg"
            >
              <Icon name="x" className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}

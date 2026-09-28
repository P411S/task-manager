import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Accessible dialog: portalled, focus-trapped, Esc to dismiss, restores focus.
 * `variant="center"` is a modal card; `variant="drawer"` slides in from the right
 * on desktop and up from the bottom on mobile.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  variant = 'center',
  side = 'right',
  size = 'md',
  footer,
  children,
  labelledBy,
  initialFocusRef,
}) {
  const panelRef = useRef(null)
  const restoreTo = useRef(null)

  const focusables = useCallback(
    () => Array.from(panelRef.current?.querySelectorAll(FOCUSABLE) ?? []),
    [],
  )

  useEffect(() => {
    if (!open) return
    restoreTo.current = document.activeElement

    const { overflow, paddingRight } = document.body.style
    // Compensate for the vanishing scrollbar so the page doesn't jump.
    const gap = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (gap > 0) document.body.style.paddingRight = `${gap}px`

    const timer = setTimeout(() => {
      const target = initialFocusRef?.current ?? focusables()[0] ?? panelRef.current
      target?.focus()
      if (target === panelRef.current) target.focus()
      // Select the text so typing replaces a prefilled value.
      if (target instanceof HTMLInputElement && target.type !== 'checkbox') target.select?.()
    }, 0)

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
      if (restoreTo.current instanceof HTMLElement) restoreTo.current.focus()
    }
  }, [open, focusables, initialFocusRef])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [open, onClose, focusables])

  if (!open) return null

  const width = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size]
  const headingId = labelledBy ?? (title ? `dialog-${title.replace(/\s+/g, '-').toLowerCase()}` : undefined)

  return createPortal(
    <div
      className={`fixed inset-0 z-50 ${
        variant === 'drawer'
          ? `flex items-end ${side === 'left' ? 'justify-start' : 'justify-center sm:justify-end'}`
          : 'flex items-end justify-center p-4 sm:items-center'
      }`}
    >
      <div
        className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        tabIndex={-1}
        className={[
          'bg-surface relative flex w-full flex-col shadow-2xl outline-none',
          variant === 'drawer'
            ? `max-h-[92dvh] rounded-t-2xl animate-rise-in sm:h-full sm:max-h-none sm:rounded-none ${
                side === 'left'
                  ? 'sm:animate-slide-in-left sm:rounded-r-2xl'
                  : 'sm:animate-slide-in-right sm:rounded-l-2xl'
              }`
            : `max-h-[92dvh] animate-pop-in rounded-2xl ${width}`,
        ].join(' ')}
      >
        {variant === 'drawer' && (
          <div
            className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-line-strong sm:hidden"
            aria-hidden="true"
          />
        )}

        {(title || variant === 'drawer') && (
          <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 sm:px-6">
            <div className="min-w-0">
              {title && (
                <h2
                  id={headingId}
                  className="truncate text-base font-semibold tracking-tight"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-fg-muted mt-1 text-sm">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="-mt-1 -mr-1 cursor-pointer rounded-lg p-1.5 text-fg-faint transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <Icon name="x" className="size-4" />
            </button>
          </header>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6">{children}</div>

        {footer && (
          <footer
            className="border-line bg-surface-2/60 flex shrink-0 items-center justify-end
              gap-2 rounded-b-2xl border-t px-5 py-3.5 sm:rounded-b-none sm:px-6"
          >
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}

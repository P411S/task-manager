import { useEffect, useRef } from 'react'

const EDITABLE = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

/** True when the user is typing, so single-key shortcuts should stand down. */
export function isTypingTarget(target) {
  if (!target) return false
  if (target.isContentEditable) return true
  return EDITABLE.has(target.tagName)
}

/**
 * Registers global single-key shortcuts.
 * `bindings` maps a lowercase key (or `shift+/` style combo) to a handler.
 */
export default function useHotkeys(bindings, { enabled = true } = {}) {
  const bindingsRef = useRef(bindings)

  // The handlers change every render; re-subscribe only when enablement changes.
  useEffect(() => {
    bindingsRef.current = bindings
  })

  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingTarget(event.target)) return

      const key = event.key.toLowerCase()
      const bindings = bindingsRef.current
      const handler =
        bindings[key] ?? bindings[`${event.shiftKey ? 'shift+' : ''}${key}`]
      if (typeof handler === 'function') {
        event.preventDefault()
        handler(event)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled])
}

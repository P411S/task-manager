import Icon from './Icon'
import { useTheme } from '../context/ThemeContext'

export default function TopBar({ title, subtitle, onOpenNav, onNewTask }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header
      className="border-line bg-canvas/85 sticky top-0 z-30 flex items-center gap-3 border-b
        px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4"
    >
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="btn-ghost -ml-1.5 px-2 lg:hidden"
      >
        <Icon name="menu" className="size-5" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
        {subtitle && <p className="text-fg-muted truncate text-xs sm:text-sm">{subtitle}</p>}
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        aria-pressed={theme === 'dark'}
        className="btn-ghost px-2"
      >
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="size-5" />
      </button>

      <button type="button" onClick={onNewTask} className="btn-primary px-3 sm:px-3.5">
        <Icon name="plus" className="size-4" strokeWidth="2.25" />
        <span className="hidden sm:inline">New task</span>
        <span className="sr-only sm:hidden">New task</span>
      </button>
    </header>
  )
}

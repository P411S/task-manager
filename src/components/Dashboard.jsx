import Icon from './Icon'
import { useData } from '../context/DataContext'

const CARDS = [
  { key: 'all', label: 'All tasks', icon: 'list', tone: 'default' },
  { key: 'dueToday', label: 'Due today', icon: 'calendar', tone: 'warning' },
  { key: 'inProgress', label: 'In progress', icon: 'clock', tone: 'accent' },
  { key: 'completed', label: 'Completed', icon: 'checkCircle', tone: 'success' },
  { key: 'overdue', label: 'Overdue', icon: 'alert', tone: 'danger' },
]

const TONE_CLASSES = {
  default: 'text-fg-muted bg-surface-2',
  warning: 'text-warning bg-warning-soft',
  accent: 'text-accent bg-accent-soft',
  success: 'text-success bg-success-soft',
  danger: 'text-danger bg-danger-soft',
}

const CARD_FOR_COUNT = {
  all: 'all',
  dueToday: 'today',
  inProgress: 'all',
  completed: 'completed',
  overdue: 'overdue',
}

/** The five summary numbers, each one a shortcut into the matching view. */
export default function Dashboard({ view, onSelectView }) {
  const { counts } = useData()

  return (
    <section aria-label="Summary">
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {CARDS.map((card) => {
          const active = view === CARD_FOR_COUNT[card.key]
          const alert = card.key === 'overdue' && counts.overdue > 0

          return (
            <li key={card.key}>
              <button
                type="button"
                onClick={() => onSelectView(CARD_FOR_COUNT[card.key])}
                aria-current={active ? 'true' : undefined}
                className={`card flex w-full cursor-pointer items-center gap-3 p-3.5 text-left
                  transition-colors hover:border-line-strong sm:flex-col sm:items-start
                  sm:gap-2.5 ${active ? 'border-accent ring-accent/25 ring-2' : ''}`}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg
                    ${TONE_CLASSES[card.tone]}`}
                >
                  <Icon name={card.icon} className="size-4" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span
                    className={`text-2xl leading-none font-semibold tracking-tight
                      tabular-nums ${alert ? 'text-danger' : ''}`}
                  >
                    {counts[card.key]}
                  </span>
                  <span className="text-fg-muted mt-1.5 text-xs font-medium">{card.label}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

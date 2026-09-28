import Icon from './Icon'
import { VIEWS, countForView } from '../lib/tasks'
import { useTheme } from '../context/ThemeContext'

const VIEW_ICONS = {
  all: 'list',
  today: 'calendar',
  upcoming: 'clock',
  overdue: 'alert',
  completed: 'checkCircle',
}

function CountPill({ value }) {
  return (
    <span
      className={`min-w-6 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold
        tabular-nums ${value > 0 ? 'bg-surface-3 text-fg-muted' : 'text-fg-faint'}`}
    >
      {value}
    </span>
  )
}

function NavButton({ active, onClick, icon, label, count, accent = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2
        text-sm transition-colors ${
          active
            ? 'bg-accent-soft text-accent font-semibold'
            : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
        }`}
    >
      <Icon
        name={icon}
        className={`size-4 shrink-0 ${active ? '' : accent ? 'text-danger' : ''}`}
      />
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      <CountPill value={count} />
    </button>
  )
}

export default function Sidebar({
  view,
  onSelectView,
  projectFilter,
  onSelectProject,
  tasks,
  projects,
  rankedProjects,
  onNewTask,
  onNewProject,
  onManageProject,
}) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <div className="flex items-center gap-2.5 px-1 pt-1">
        <span className="bg-accent text-accent-fg flex size-8 shrink-0 items-center justify-center rounded-lg">
          <Icon name="checkCircle" className="size-4.5" strokeWidth="2" />
        </span>
        <span className="truncate text-sm font-semibold tracking-tight">Task Manager</span>
      </div>

      <button type="button" onClick={onNewTask} className="btn-primary w-full">
        <Icon name="plus" className="size-4" strokeWidth="2.25" />
        New task
        <kbd className="ml-auto hidden rounded border border-current/25 px-1 text-[10px] opacity-70 sm:inline">
          N
        </kbd>
      </button>

      <nav aria-label="Views" className="flex flex-col gap-0.5">
        <h2 className="text-fg-faint mb-1 px-2.5 text-[11px] font-semibold tracking-wider uppercase">
          Views
        </h2>
        {VIEWS.map((item) => (
          <NavButton
            key={item.value}
            active={view === item.value && !projectFilter}
            icon={VIEW_ICONS[item.value]}
            label={item.label}
            count={countForView(tasks, item.value)}
            accent={item.value === 'overdue'}
            onClick={() => onSelectView(item.value)}
          />
        ))}
      </nav>

      <div className="flex flex-col gap-0.5">
        <div className="mb-1 flex items-center justify-between px-2.5">
          <h2 className="text-fg-faint text-[11px] font-semibold tracking-wider uppercase">
            Projects
          </h2>
          <button
            type="button"
            onClick={onNewProject}
            aria-label="Create project"
            className="text-fg-faint hover:text-fg cursor-pointer rounded p-0.5 transition-colors"
          >
            <Icon name="plus" className="size-4" strokeWidth="2.25" />
          </button>
        </div>

        <NavButton
          active={projectFilter === 'unassigned'}
          icon="inbox"
          label="No project"
          count={tasks.filter((task) => !task.projectId).length}
          onClick={() => onSelectProject('unassigned')}
        />

        {rankedProjects.map((project) => (
          <div key={project.id} className="group/project relative flex items-center">
            <NavButton
              active={projectFilter === project.id}
              icon="folder"
              label={project.name}
              count={project.count}
              onClick={() => onSelectProject(project.id)}
            />
            <button
              type="button"
              onClick={() => onManageProject(project)}
              aria-label={`Manage ${project.name}`}
              className="text-fg-faint hover:text-fg absolute right-2 cursor-pointer rounded
                p-1 opacity-0 transition-opacity group-hover/project:opacity-100
                focus-visible:opacity-100"
            >
              <Icon name="sliders" className="size-3.5" />
            </button>
          </div>
        ))}

        {projects.length === 0 && (
          <p className="text-fg-faint px-2.5 py-2 text-xs">
            No projects yet. Create one to group your work.
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-3 border-t pt-4">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="border-line text-fg-muted hover:border-line-strong hover:text-fg flex
            cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2 text-sm
            transition-colors"
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="size-4" />
          <span className="flex-1 text-left">{theme === 'dark' ? 'Light' : 'Dark'} mode</span>
          <kbd className="rounded border border-line-strong px-1 text-[10px]">T</kbd>
        </button>

        <dl className="text-fg-faint grid grid-cols-2 gap-x-3 gap-y-1 px-1 text-[11px]">
          {[
            ['Search', '/'],
            ['New task', 'N'],
            ['Switch view', '1–5'],
            ['Close', 'Esc'],
          ].map(([label, key]) => (
            <div key={label} className="flex items-center justify-between gap-1">
              <dt>{label}</dt>
              <dd className="rounded border border-line px-1 font-medium">{key}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

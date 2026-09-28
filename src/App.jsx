import { useCallback, useMemo, useRef, useState } from 'react'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Toolbar from './components/Toolbar'
import TaskList from './components/TaskList'
import TaskDialog from './components/TaskDialog'
import TaskDetail from './components/TaskDetail'
import ProjectDialog from './components/ProjectDialog'
import Modal from './components/Modal'
import Icon from './components/Icon'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { ToastProvider, useToast } from './context/ToastContext'
import { DataProvider, useData } from './context/DataContext'
import useHotkeys from './hooks/useHotkeys'
import { VIEWS, filterTasks, sortTasks } from './lib/tasks'
import { persistenceAvailable } from './lib/storage'

const VIEW_SHORTCUTS = {
  1: 'all',
  2: 'today',
  3: 'upcoming',
  4: 'overdue',
  5: 'completed',
}

function Workspace() {
  const { tasks, projects, rankedProjects, getProject, toggleTask, restoreSeedData } = useData()
  const { toggleTheme } = useTheme()
  const { notify } = useToast()

  const [view, setView] = useState('all')
  const [projectFilter, setProjectFilter] = useState(null)
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('due')

  const [openTaskId, setOpenTaskId] = useState(null)
  const [creatingTask, setCreatingTask] = useState(false)
  const [projectDialog, setProjectDialog] = useState({ open: false, project: null })
  const [navOpen, setNavOpen] = useState(false)

  const searchRef = useRef(null)

  const visibleTasks = useMemo(
    () => sortTasks(filterTasks(tasks, { view, projectFilter, priority, status, search }), sort),
    [tasks, view, projectFilter, priority, status, search, sort],
  )

  const isFiltered = Boolean(search) || priority !== 'all' || status !== 'all' || Boolean(projectFilter)

  const resetFilters = useCallback(() => {
    setSearch('')
    setPriority('all')
    setStatus('all')
    setProjectFilter(null)
  }, [])

  const selectView = useCallback((next) => {
    setView(next)
    setProjectFilter(null)
    setNavOpen(false)
  }, [])

  const selectProject = useCallback((projectId) => {
    setView('all')
    setProjectFilter(projectId)
    setNavOpen(false)
  }, [])

  const openNewTask = useCallback(() => {
    setNavOpen(false)
    setCreatingTask(true)
  }, [])

  // Global shortcuts stand down whenever a dialog owns the screen.
  const dialogOpen = Boolean(openTaskId) || creatingTask || projectDialog.open || navOpen

  useHotkeys(
    {
      n: openNewTask,
      '/': () => {
        searchRef.current?.focus()
        searchRef.current?.select()
      },
      t: toggleTheme,
      ...Object.fromEntries(
        Object.entries(VIEW_SHORTCUTS).map(([digit, target]) => [
          digit,
          () => selectView(target),
        ]),
      ),
      escape: () => {
        if (search) setSearch('')
        else if (isFiltered) resetFilters()
      },
    },
    { enabled: !dialogOpen },
  )

  const activeProject = projectFilter ? projects.find((p) => p.id === projectFilter) : null
  const title = activeProject
    ? activeProject.name
    : (VIEWS.find((item) => item.value === view)?.label ?? 'Tasks')
  const subtitle = isFiltered
    ? `${visibleTasks.length} ${visibleTasks.length === 1 ? 'task' : 'tasks'} match your filters`
    : 'Capture, organize, prioritize, complete.'

  const sidebar = (
    <Sidebar
      view={view}
      onSelectView={selectView}
      projectFilter={projectFilter}
      onSelectProject={selectProject}
      tasks={tasks}
      projects={projects}
      rankedProjects={rankedProjects}
      onNewTask={openNewTask}
      onNewProject={() => {
        setNavOpen(false)
        setProjectDialog({ open: true, project: null })
      }}
      onManageProject={(project) => {
        setNavOpen(false)
        setProjectDialog({ open: true, project })
      }}
    />
  )

  return (
    <div className="flex min-h-dvh">
      <aside className="border-line bg-surface hidden w-64 shrink-0 border-r lg:block">
        <div className="sticky top-0 h-dvh">{sidebar}</div>
      </aside>

      <Modal open={navOpen} onClose={() => setNavOpen(false)} variant="drawer" side="left" labelledBy="nav-title">
        <h2 id="nav-title" className="sr-only">
          Navigation
        </h2>
        {sidebar}
      </Modal>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} subtitle={subtitle} onOpenNav={() => setNavOpen(true)} onNewTask={openNewTask} />

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6">
          <Dashboard view={view} onSelectView={selectView} />

          <Toolbar
            search={search}
            onSearchChange={setSearch}
            searchRef={searchRef}
            projectFilter={projectFilter ?? 'all'}
            onProjectFilterChange={(value) => setProjectFilter(value === 'all' ? null : value)}
            priority={priority}
            onPriorityChange={setPriority}
            status={status}
            onStatusChange={setStatus}
            sort={sort}
            onSortChange={setSort}
            projects={projects}
            isFiltered={isFiltered}
            onReset={resetFilters}
            resultCount={visibleTasks.length}
          />

          {projectFilter && (
            <div className="flex items-center gap-2">
              <span className="chip">
                {activeProject ? (
                  <>
                    <span className={`size-2 rounded-full ${activeProject.color}`} />
                    {activeProject.name}
                  </>
                ) : (
                  <>
                    <Icon name="inbox" className="size-3.5" />
                    No project
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setProjectFilter(null)}
                  aria-label="Clear project filter"
                  className="hover:text-fg -mr-1 cursor-pointer rounded p-0.5 transition-colors"
                >
                  <Icon name="x" className="size-3.5" />
                </button>
              </span>
            </div>
          )}

          <TaskList
            key={view}
            tasks={visibleTasks}
            getProject={getProject}
            view={view}
            isFiltered={isFiltered}
            onClearFilters={resetFilters}
            onOpen={setOpenTaskId}
            onToggle={toggleTask}
            onCreate={openNewTask}
          />

          <footer className="border-line text-fg-faint mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-4 text-xs">
            <span>Data is stored locally in your browser.</span>
            <button
              type="button"
              onClick={() => {
                restoreSeedData()
                resetFilters()
                notify('Seed data restored', { tone: 'success' })
              }}
              className="hover:text-fg cursor-pointer underline underline-offset-4 transition-colors"
            >
              Restore seed data
            </button>
          </footer>
        </main>
      </div>

      <TaskDialog open={creatingTask} onClose={() => setCreatingTask(false)} />

      {openTaskId && (
        <TaskDetail
          key={openTaskId}
          taskId={openTaskId}
          onClose={() => setOpenTaskId(null)}
          onDeleted={() => setOpenTaskId(null)}
        />
      )}

      {projectDialog.open && (
        <ProjectDialog
          key={projectDialog.project?.id ?? 'new'}
          project={projectDialog.project}
          onClose={() => setProjectDialog({ open: false, project: null })}
          onDeleted={() => setProjectDialog({ open: false, project: null })}
        />
      )}

      {!persistenceAvailable && (
        <div className="bg-warning-soft text-warning fixed inset-x-0 bottom-0 z-100 px-4 py-2 text-center text-xs sm:hidden">
          Storage is blocked — changes will not survive a refresh.
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <DataProvider>
          <Workspace />
        </DataProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

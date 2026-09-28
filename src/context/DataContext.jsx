import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { loadState, resetToSeed, saveProjects, saveTasks } from '../lib/storage'
import { getCounts, newId, rankProjects } from '../lib/tasks'
import { useToast } from './ToastContext'

const DataContext = createContext(null)

const normalise = (input) => ({
  title: (input.title ?? '').trim(),
  description: (input.description ?? '').trim(),
  dueDate: input.dueDate || null,
  priority: input.priority ?? 'medium',
  status: input.status ?? 'todo',
  projectId: input.projectId || null,
})

export function DataProvider({ children }) {
  const { notify } = useToast()
  const [initial] = useState(loadState)
  const [tasks, setTasks] = useState(initial.tasks)
  const [projects, setProjects] = useState(initial.projects)

  // Local-only persistence: every change survives a refresh.
  useEffect(() => saveTasks(tasks), [tasks])
  useEffect(() => saveProjects(projects), [projects])

  const getProject = useCallback(
    (projectId) => projects.find((project) => project.id === projectId) ?? null,
    [projects],
  )

  const addTask = useCallback((input) => {
    const task = {
      id: newId('t'),
      ...normalise(input),
      createdAt: new Date().toISOString(),
      completedAt: null,
      prevStatus: null,
    }
    setTasks((current) => [task, ...current])
    notify('Task added', { tone: 'success' })
    return task
  }, [notify])

  const updateTask = useCallback((id, changes) => {
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== id) return task
        const next = { ...task, ...normalise({ ...task, ...changes }) }
        // Keep the completion stamp and the pre-completion status consistent.
        if (next.status === 'completed' && task.status !== 'completed') {
          next.completedAt = new Date().toISOString()
          next.prevStatus = task.status
        } else if (next.status !== 'completed') {
          next.completedAt = null
        }
        return next
      }),
    )
  }, [])

  const deleteTask = useCallback((id) => {
    setTasks((current) => current.filter((task) => task.id !== id))
    notify('Task deleted', { tone: 'danger' })
  }, [notify])

  const toggleTask = useCallback(
    (id) => {
      const task = tasks.find((item) => item.id === id)
      if (!task) return
      const completing = task.status !== 'completed'
      setTasks((current) =>
        current.map((item) =>
          item.id !== id
            ? item
            : {
                ...item,
                // Reopening restores the status it had before completion.
                status: completing ? 'completed' : (item.prevStatus ?? 'todo'),
                prevStatus: completing ? item.status : item.prevStatus,
                completedAt: completing ? new Date().toISOString() : null,
              },
        ),
      )
      notify(completing ? `Completed “${task.title}”` : `Reopened “${task.title}”`, {
        tone: completing ? 'success' : 'info',
      })
    },
    [notify, tasks],
  )

  const addProject = useCallback(
    (name, color) => {
      const project = {
        id: newId('p'),
        name: name.trim(),
        color,
        createdAt: new Date().toISOString(),
      }
      setProjects((current) => [...current, project])
      notify(`Project “${project.name}” created`, { tone: 'success' })
      return project
    },
    [notify],
  )

  /** Rename and/or recolour a project. */
  const updateProject = useCallback((id, changes) => {
    setProjects((current) =>
      current.map((project) => {
        if (project.id !== id) return project
        return {
          ...project,
          name: changes.name?.trim() || project.name,
          color: changes.color ?? project.color,
        }
      }),
    )
  }, [])

  /** `strategy` decides what happens to the project's tasks. */
  const deleteProject = useCallback(
    (id, strategy = 'unassign') => {
      const project = projects.find((p) => p.id === id)
      setProjects((current) => current.filter((p) => p.id !== id))
      setTasks((current) =>
        strategy === 'delete-tasks'
          ? current.filter((task) => task.projectId !== id)
          : current.map((task) => (task.projectId === id ? { ...task, projectId: null } : task)),
      )
      if (project) notify(`Project “${project.name}” deleted`, { tone: 'danger' })
    },
    [notify, projects],
  )

  const restoreSeedData = useCallback(() => {
    const seed = resetToSeed()
    setTasks(seed.tasks)
    setProjects(seed.projects)
    notify('Seed data restored', { tone: 'success' })
  }, [notify])

  const counts = useMemo(() => getCounts(tasks), [tasks])
  const rankedProjects = useMemo(() => rankProjects(projects, tasks), [projects, tasks])

  const value = useMemo(
    () => ({
      tasks,
      projects,
      rankedProjects,
      counts,
      getProject,
      addTask,
      updateTask,
      deleteTask,
      toggleTask,
      addProject,
      updateProject,
      deleteProject,
      restoreSeedData,
    }),
    [
      tasks,
      projects,
      rankedProjects,
      counts,
      getProject,
      addTask,
      updateTask,
      deleteTask,
      toggleTask,
      addProject,
      updateProject,
      deleteProject,
      restoreSeedData,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used inside <DataProvider>')
  return context
}

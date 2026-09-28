import { useCallback, useRef, useState } from 'react'
import TaskItem from './TaskItem'
import EmptyState from './EmptyState'
import Icon from './Icon'

const VIEW_EMPTY = {
  all: {
    icon: 'inbox',
    title: 'No tasks yet',
    message: 'Capture your first task to get started.',
  },
  today: {
    icon: 'calendar',
    title: 'Nothing due today',
    message: 'Enjoy the clear runway, or add something with a due date.',
  },
  upcoming: {
    icon: 'clock',
    title: 'Nothing upcoming',
    message: 'Tasks with a future due date will show up here.',
  },
  overdue: {
    icon: 'checkCircle',
    title: 'Nothing overdue',
    message: 'You are all caught up. Nice work.',
  },
  completed: {
    icon: 'checkCircle',
    title: 'Nothing completed yet',
    message: 'Finished tasks are collected here.',
  },
}

/** The filtered list, with arrow-key navigation between rows. */
export default function TaskList({
  tasks,
  getProject,
  view,
  onOpen,
  onToggle,
  onCreate,
  isFiltered,
  onClearFilters,
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const itemRefs = useRef([])

  // Clamp rather than store: the list can shrink under us at any time.
  const cursor = Math.min(activeIndex, Math.max(tasks.length - 1, 0))

  const move = useCallback(
    (delta) => {
      setActiveIndex((current) => {
        const next = Math.min(Math.max(current + delta, 0), tasks.length - 1)
        itemRefs.current[next]?.focus()
        return next
      })
    },
    [tasks.length],
  )

  const onKeyDown = useCallback(
    (index) => (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        move(1)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        move(-1)
      } else if (event.key === 'Home') {
        event.preventDefault()
        setActiveIndex(0)
        itemRefs.current[0]?.focus()
      } else if (event.key === 'End') {
        event.preventDefault()
        setActiveIndex(tasks.length - 1)
        itemRefs.current[tasks.length - 1]?.focus()
      } else if (event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault()
        onToggle(tasks[index].id)
      }
    },
    [move, onToggle, tasks],
  )

  if (tasks.length === 0) {
    const copy = VIEW_EMPTY[view] ?? VIEW_EMPTY.all
    return (
      <div className="card overflow-hidden">
        <EmptyState
          {...copy}
          action={
            isFiltered ? (
              <button type="button" onClick={onClearFilters} className="btn-outline">
                <Icon name="x" className="size-4" />
                Clear search and filters
              </button>
            ) : (
              <button type="button" onClick={onCreate} className="btn-primary">
                <Icon name="plus" className="size-4" strokeWidth="2.25" />
                New task
              </button>
            )
          }
        />
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <ul
        role="list"
        aria-label="Tasks"
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && event.target.tagName === 'UL') {
            event.preventDefault()
            move(1)
          }
        }}
      >
        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            project={getProject(task.projectId)}
            onOpen={onOpen}
            onToggle={onToggle}
            isActive={index === cursor}
            tabIndex={index === cursor ? 0 : -1}
            onKeyDown={onKeyDown(index)}
            ref={(node) => {
              itemRefs.current[index] = node
            }}
          />
        ))}
      </ul>
    </div>
  )
}

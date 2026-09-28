import { forwardRef } from 'react'
import Icon from './Icon'
import { PRIORITIES, SORTS, STATUSES } from '../lib/tasks'

const selectClass =
  'field cursor-pointer appearance-none py-2 pr-8 text-sm capitalize'

function Select({ label, icon, value, onChange, children, ...rest }) {
  return (
    <div className="relative">
      <label className="sr-only" htmlFor={rest.id}>
        {label}
      </label>
      {icon && (
        <Icon
          name={icon}
          className="text-fg-faint pointer-events-none absolute top-1/2 left-2.5 size-4
            -translate-y-1/2"
        />
      )}
      <select
        id={rest.id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${selectClass} ${icon ? 'pl-8' : ''}`}
        {...rest}
      >
        {children}
      </select>
      <Icon
        name="chevronDown"
        className="text-fg-faint pointer-events-none absolute top-1/2 right-2.5 size-4
          -translate-y-1/2"
      />
    </div>
  )
}

const SearchInput = forwardRef(function SearchInput({ value, onChange }, ref) {
  return (
    <div className="relative min-w-0 flex-1">
      <label className="sr-only" htmlFor="task-search">
        Search tasks
      </label>
      <Icon
        name="search"
        className="text-fg-faint pointer-events-none absolute top-1/2 left-3 size-4
          -translate-y-1/2"
      />
      <input
        id="task-search"
        ref={ref}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search tasks…"
        className="field py-2 pr-16 pl-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="text-fg-faint hover:text-fg absolute top-1/2 right-2 -translate-y-1/2
            cursor-pointer rounded-md p-1 transition-colors"
        >
          <Icon name="x" className="size-4" />
        </button>
      ) : (
        <kbd
          className="text-fg-faint border-line pointer-events-none absolute top-1/2 right-2.5
            -translate-y-1/2 rounded border px-1.5 py-0.5 text-[10px] font-medium"
          aria-hidden="true"
        >
          /
        </kbd>
      )}
    </div>
  )
})

export default function Toolbar({
  search,
  onSearchChange,
  projectFilter,
  onProjectFilterChange,
  priority,
  onPriorityChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  projects,
  isFiltered,
  onReset,
  searchRef,
  resultCount,
}) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
      <SearchInput ref={searchRef} value={search} onChange={onSearchChange} />

      <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-1 sm:justify-end">
        <Select
          id="filter-project"
          label="Filter by project"
          icon="folder"
          value={projectFilter}
          onChange={onProjectFilterChange}
        >
          <option value="all">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
          <option value="unassigned">No project</option>
        </Select>

        <Select
          id="filter-priority"
          label="Filter by priority"
          icon="alert"
          value={priority}
          onChange={onPriorityChange}
        >
          <option value="all">All priorities</option>
          {PRIORITIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>

        <Select
          id="filter-status"
          label="Filter by status"
          icon="checkCircle"
          value={status}
          onChange={onStatusChange}
        >
          <option value="all">All statuses</option>
          {STATUSES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>

        <Select
          id="sort-tasks"
          label="Sort tasks"
          icon="arrowUpDown"
          value={sort}
          onChange={onSortChange}
        >
          {SORTS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
      </div>

      {isFiltered && (
        <div className="flex items-center gap-2 sm:ml-1">
          <p className="text-fg-faint text-xs whitespace-nowrap">
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </p>
          <button
            type="button"
            onClick={onReset}
            className="text-fg-muted hover:text-fg cursor-pointer text-xs font-medium
              underline underline-offset-4 transition-colors"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  )
}

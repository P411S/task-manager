# Task Manager

A fast, focused task manager for one person: capture, organize, prioritize and
complete work across projects. React + Vite + Tailwind CSS, no backend.

Everything is stored in the browser's `localStorage`, so there is no account, no
server and no sync — and nothing is lost when the page reloads.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |

## How it works

### Data model

A task:

| Field | Type | Required |
| --- | --- | --- |
| `title` | text | yes |
| `description` | long text | no |
| `dueDate` | date (`YYYY-MM-DD`) | no |
| `priority` | `low` · `medium` · `high` | yes |
| `status` | `todo` · `in-progress` · `completed` | yes |
| `projectId` | one of the projects | no |
| `createdAt` | timestamp, set on creation | automatic |

`completedAt` and `prevStatus` are internal: they record when a task was finished
and which status to restore when it is reopened.

A project is `{ id, name, color, createdAt }`.

### Seed data

The app is never empty on first run. `src/lib/seed.js` provides 3 projects and 6
tasks, with due dates generated relative to the day the seed is created, so the
dashboard shows a meaningful spread whenever the app is first opened. **Restore
seed data** in the footer resets to it at any time.

### Features

- **Tasks** — add, edit, delete, complete and reopen. Changing any field is done
  in the detail view, which opens when you click a task.
- **Projects** — create, rename, recolour and delete, with a live task count per
  project. Deleting a project asks whether to move its tasks to "No project" or
  delete them too.
- **Views** — All tasks, Today, Upcoming, Overdue, Completed.
- **Filters** — project, priority and status, plus free-text search over title
  and description.
- **Sort** — due date, priority, created date or A to Z. Tasks without a due date
  always sort last.
- **Dashboard** — five counts: all tasks, due today, in progress, completed and
  overdue. Each is a shortcut into the matching view.

### Interaction details

- Clicking a task row opens its detail and edit view; the checkbox toggles
  completion without opening it.
- Overdue tasks carry a red left edge and tint; completed tasks are dimmed with a
  struck-through title.
- Deleting a task or project always asks for confirmation first.
- Every action raises a toast, and empty views explain what to do next.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `N` | New task |
| `/` | Focus search |
| `1`–`5` | Switch view |
| `T` | Toggle light/dark |
| `↑` `↓` | Move between tasks |
| `Space` | Complete or reopen the focused task |
| `Enter` | Open the focused task |
| `Ctrl`/`Cmd` + `Enter` | Save from a form |
| `Esc` | Close a dialog, clear search, then filters |

Shortcuts stand down while you are typing in a field, and while a dialog is open
(which manages its own focus and traps `Tab`).

### Theming

`src/index.css` defines one set of semantic colour tokens per theme
(`--surface`, `--fg`, `--accent`, …) and re-points them for dark mode, so light
and dark stay equally polished. Dark mode is class-based, applied before first
paint by a small inline script in `index.html` to avoid a flash, and defaults to
the OS preference until you choose a theme yourself. All text pairs meet WCAG AA
contrast in both themes.

## Project structure

```
src/
  App.jsx                 layout, filtering, sorting, global shortcuts
  index.css               Tailwind entry + design tokens and component classes
  components/             presentational units
  context/                Data, Theme and Toast providers
  hooks/useHotkeys.js     global single-key shortcuts
  lib/                    dates, seed data, localStorage, task queries
```

## Deployment

The build is static, so it deploys anywhere. For Vercel, import the repository and
keep the detected framework settings. Every push to `main` redeploys.

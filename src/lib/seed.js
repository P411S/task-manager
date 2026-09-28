import { dayOffsetKey } from './dates'

/**
 * First-run data. The app never opens empty.
 *
 * Due dates are generated relative to the day the seed is created, so the
 * dashboard always shows a meaningful spread (1 due today, 1 overdue) no matter
 * when the app is first opened.
 */
export function createSeedData() {
  const now = Date.now()
  const ago = (mins) => new Date(now - mins * 60_000).toISOString()

  const projects = [
    { id: 'p_design', name: 'Design System', color: 'bg-violet-500', createdAt: ago(60 * 24 * 12) },
    { id: 'p_platform', name: 'Platform', color: 'bg-sky-500', createdAt: ago(60 * 24 * 8) },
    { id: 'p_growth', name: 'Growth', color: 'bg-amber-500', createdAt: ago(60 * 24 * 3) },
  ]

  const tasks = [
    {
      id: 't_brief',
      title: 'Draft the Q3 product brief',
      description:
        'Pull the roadmap, the open risks and the three bets we want funding for. Keep it to one page.',
      dueDate: dayOffsetKey(0),
      priority: 'high',
      status: 'in-progress',
      projectId: 'p_design',
      createdAt: ago(60 * 24 * 5),
      completedAt: null,
    },
    {
      id: 't_mockups',
      title: 'Review landing page mockups',
      description: 'Second round. Focus on the hero hierarchy and the pricing table.',
      dueDate: dayOffsetKey(-2),
      priority: 'medium',
      status: 'todo',
      projectId: 'p_design',
      createdAt: ago(60 * 24 * 6),
      completedAt: null,
    },
    {
      id: 't_ci',
      title: 'Set up the CI pipeline',
      description: 'Lint, test and build on every push. Cache the dependency layer.',
      dueDate: dayOffsetKey(3),
      priority: 'high',
      status: 'in-progress',
      projectId: 'p_platform',
      createdAt: ago(60 * 24 * 4),
      completedAt: null,
    },
    {
      id: 't_onboarding',
      title: 'Write the onboarding emails',
      description: 'Five-part sequence for new signups. Plain language, one idea per email.',
      dueDate: null,
      priority: 'medium',
      status: 'todo',
      projectId: 'p_growth',
      createdAt: ago(60 * 24 * 2),
      completedAt: null,
    },
    {
      id: 't_analytics',
      title: 'Migrate analytics to v2',
      description: 'Events are mapped. Needs a final check on the conversion funnel.',
      dueDate: dayOffsetKey(-4),
      priority: 'low',
      status: 'completed',
      projectId: 'p_platform',
      createdAt: ago(60 * 24 * 9),
      completedAt: ago(60 * 24 * 1),
    },
    {
      id: 't_pricing',
      title: 'Update the pricing page copy',
      description: '',
      dueDate: dayOffsetKey(7),
      priority: 'low',
      status: 'todo',
      projectId: null,
      createdAt: ago(60 * 24 * 1),
      completedAt: null,
    },
  ]

  return { projects, tasks }
}

/** The project palette offered when creating or renaming a project. */
export const PROJECT_COLORS = [
  { name: 'violet', className: 'bg-violet-500' },
  { name: 'sky', className: 'bg-sky-500' },
  { name: 'emerald', className: 'bg-emerald-500' },
  { name: 'amber', className: 'bg-amber-500' },
  { name: 'rose', className: 'bg-rose-500' },
  { name: 'slate', className: 'bg-slate-500' },
]

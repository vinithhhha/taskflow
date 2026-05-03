export const initials = name =>
  name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'

export const formatDate = d =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

export const isOverdue = (dueDate, status) =>
  dueDate && status !== 'DONE' && new Date(dueDate) < new Date(new Date().toDateString())

export const toast = (msg, type = 'info') => {
  const el = document.getElementById('toast')
  el.textContent = msg
  el.style.borderColor = type === 'error' ? 'var(--red)' : type === 'success' ? 'var(--green)' : 'var(--border)'
  el.classList.add('show')
  setTimeout(() => el.classList.remove('show'), 3000)
}

export const statusLabel = s => ({ TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }[s] || s)
export const statusClass = s => ({ TODO: 'badge-todo', IN_PROGRESS: 'badge-in_progress', DONE: 'badge-done' }[s] || '')
export const priorityClass = p => ({ LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high' }[p] || '')

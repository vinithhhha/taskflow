import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { formatDate, isOverdue, initials, priorityClass, statusLabel, toast } from '../utils'

const COLS = [
  { key: 'TODO', label: 'To Do', color: 'var(--text2)' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'var(--accent)' },
  { key: 'DONE', label: 'Done', color: 'var(--green)' },
]

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [taskModal, setTaskModal] = useState(false)
  const [membersModal, setMembersModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [defaultStatus, setDefaultStatus] = useState('TODO')
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assigneeId: '', status: 'TODO', priority: 'MEDIUM', dueDate: '' })
  const [projectForm, setProjectForm] = useState({ name: '', description: '' })
  const [addMemberForm, setAddMemberForm] = useState({ userId: '', role: 'MEMBER' })
  const [taskError, setTaskError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadProject = () => api.get(`/projects/${id}`).then(r => { setProject(r.data); setMembers(r.data.members) }).catch(() => navigate('/projects'))
  const loadTasks = () => api.get(`/projects/${id}/tasks`).then(r => setTasks(r.data)).catch(() => {})
  const loadUsers = () => api.get('/users').then(r => setAllUsers(r.data)).catch(() => {})

  useEffect(() => { loadProject(); loadTasks(); loadUsers() }, [id])

  const setT = k => e => setTaskForm(f => ({ ...f, [k]: e.target.value }))

  const openTaskModal = (status = 'TODO', task = null) => {
    setEditingTask(task)
    setDefaultStatus(status)
    setTaskForm(task ? {
      title: task.title, description: task.description || '',
      assigneeId: task.assignee?.id || '', status: task.status,
      priority: task.priority, dueDate: task.dueDate || ''
    } : { title: '', description: '', assigneeId: '', status, priority: 'MEDIUM', dueDate: '' })
    setTaskError('')
    setTaskModal(true)
  }

  const saveTask = async () => {
    if (!taskForm.title.trim()) return setTaskError('Title is required')
    setLoading(true); setTaskError('')
    try {
      const payload = { ...taskForm, assigneeId: taskForm.assigneeId || null, dueDate: taskForm.dueDate || null }
      if (editingTask) await api.put(`/tasks/${editingTask.id}`, payload)
      else await api.post(`/projects/${id}/tasks`, payload)
      toast(editingTask ? 'Task updated!' : 'Task created!', 'success')
      setTaskModal(false); loadTasks()
    } catch (e) { setTaskError(typeof e === 'string' ? e : 'Failed') }
    finally { setLoading(false) }
  }

  const deleteTask = async () => {
    if (!confirm('Delete this task?')) return
    await api.delete(`/tasks/${editingTask.id}`).catch(() => {})
    toast('Task deleted', 'success'); setTaskModal(false); loadTasks()
  }

  const deleteProject = async () => {
    if (!confirm('Delete this project and all its tasks?')) return
    await api.delete(`/projects/${id}`)
    toast('Project deleted', 'success'); navigate('/projects')
  }

  const saveProject = async () => {
    await api.put(`/projects/${id}`, projectForm)
    toast('Project updated!', 'success'); setEditModal(false); loadProject()
  }

  const addMember = async () => {
    if (!addMemberForm.userId) return
    try {
      await api.post(`/projects/${id}/members`, addMemberForm)
      toast('Member added!', 'success'); loadProject()
      setAddMemberForm({ userId: '', role: 'MEMBER' })
    } catch (e) { toast(typeof e === 'string' ? e : 'Failed', 'error') }
  }

  const removeMember = async (userId) => {
    if (!confirm('Remove this member?')) return
    await api.delete(`/projects/${id}/members/${userId}`)
    toast('Member removed', 'success'); loadProject()
  }

  const memberIds = new Set(members.map(m => m.id))
  const nonMembers = allUsers.filter(u => !memberIds.has(u.id))
  const canManage = user?.role === 'ADMIN' || project?.owner?.id === user?.id

  if (!project) return <div className="loading">Loading...</div>

  return (
    <>
      <div className="topbar">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/projects')} style={{ marginRight: 10 }}>← Back</button>
          <span className="page-title">{project.name}</span>
          {project.description && <span className="text-muted text-sm" style={{ marginLeft: 10 }}>{project.description}</span>}
        </div>
        <div className="topbar-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => { setProjectForm({ name: project.name, description: project.description || '' }); setEditModal(true) }}>Edit</button>
          {canManage && <button className="btn btn-danger btn-sm" onClick={deleteProject}>Delete</button>}
          <button className="btn btn-secondary btn-sm" onClick={() => setMembersModal(true)}>👥 Members ({members.length})</button>
          <button className="btn btn-primary" onClick={() => openTaskModal()}>+ Add Task</button>
        </div>
      </div>

      <div className="page-content">
        <div className="kanban">
          {COLS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key)
            return (
              <div className="kanban-col" key={col.key}>
                <div className="kanban-col-header">
                  <div className="kanban-col-title" style={{ color: col.color }}>
                    {col.label} <span className="col-count">{colTasks.length}</span>
                  </div>
                  <button className="btn btn-icon btn-sm" onClick={() => openTaskModal(col.key)} title="Add task">+</button>
                </div>
                {colTasks.length === 0
                  ? <div className="empty" style={{ padding: '20px 0' }}><div className="empty-text" style={{ fontSize: 12 }}>No tasks</div></div>
                  : colTasks.map(t => (
                    <div className="kanban-card" key={t.id} onClick={() => openTaskModal(t.status, t)}>
                      <div className="kanban-card-title">{t.title}</div>
                      <div className="flex gap-2 mb-2">
                        <span className={`badge ${priorityClass(t.priority)}`}>{t.priority?.toLowerCase()}</span>
                        {t.dueDate && <span className={`badge ${isOverdue(t.dueDate, t.status) ? 'badge-high' : 'badge-todo'}`} style={{ fontSize: 10 }}>
                          {isOverdue(t.dueDate, t.status) ? '⚠ ' : ''}{formatDate(t.dueDate)}
                        </span>}
                      </div>
                      <div className="kanban-card-footer">
                        {t.assignee
                          ? <><span className="avatar-sm">{initials(t.assignee.name)}</span>
                              <span className="text-sm text-muted">{t.assignee.name}</span></>
                          : <span className="text-sm text-muted">Unassigned</span>}
                      </div>
                    </div>
                  ))
                }
              </div>
            )
          })}
        </div>
      </div>

      {/* Task Modal */}
      {taskModal && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editingTask ? 'Edit Task' : 'New Task'}</div>
              <button className="modal-close" onClick={() => setTaskModal(false)}>✕</button>
            </div>
            {taskError && <div className="alert alert-error">{taskError}</div>}
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" placeholder="Task title" value={taskForm.title} onChange={setT('title')} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Details..." value={taskForm.description} onChange={setT('description')} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={taskForm.status} onChange={setT('status')}>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" value={taskForm.priority} onChange={setT('priority')}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select className="form-select" value={taskForm.assigneeId} onChange={setT('assigneeId')}>
                  <option value="">Unassigned</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-input" value={taskForm.dueDate} onChange={setT('dueDate')} />
              </div>
            </div>
            <div className="modal-footer">
              {editingTask && <button className="btn btn-danger btn-sm" onClick={deleteTask}>Delete</button>}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => setTaskModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveTask} disabled={loading}>Save Task</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {membersModal && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Project Members</div>
              <button className="modal-close" onClick={() => setMembersModal(false)}>✕</button>
            </div>
            <div style={{ marginBottom: 18 }}>
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-2 justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <div className="avatar">{initials(m.name)}</div>
                    <div><div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div><div className="text-sm text-muted">{m.email}</div></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge badge-${m.projectRole?.toLowerCase()}`}>{m.projectRole}</span>
                    {canManage && project.owner?.id !== m.id &&
                      <button className="btn btn-icon btn-sm" onClick={() => removeMember(m.id)}>✕</button>}
                  </div>
                </div>
              ))}
            </div>
            {canManage && nonMembers.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <div className="card-title mb-2">Add Member</div>
                <div className="flex gap-2">
                  <select className="form-select" style={{ flex: 1 }} value={addMemberForm.userId} onChange={e => setAddMemberForm(f => ({ ...f, userId: e.target.value }))}>
                    <option value="">Select user...</option>
                    {nonMembers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                  </select>
                  <select className="form-select" style={{ width: 110 }} value={addMemberForm.role} onChange={e => setAddMemberForm(f => ({ ...f, role: e.target.value }))}>
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button className="btn btn-primary" onClick={addMember}>Add</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editModal && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Edit Project</div>
              <button className="modal-close" onClick={() => setEditModal(false)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input className="form-input" value={projectForm.name} onChange={e => setProjectForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={projectForm.description} onChange={e => setProjectForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveProject}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { formatDate, toast } from '../utils'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const load = () => api.get('/projects').then(r => setProjects(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const save = async () => {
    if (!form.name.trim()) return setError('Project name is required')
    setLoading(true); setError('')
    try {
      await api.post('/projects', form)
      toast('Project created!', 'success')
      setModal(false); setForm({ name: '', description: '' }); load()
    } catch (e) { setError(typeof e === 'string' ? e : 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <>
      <div className="topbar">
        <div className="page-title">Projects</div>
        <div className="topbar-actions">
          <button className="btn btn-primary" onClick={() => { setModal(true); setError('') }}>+ New Project</button>
        </div>
      </div>

      <div className="page-content">
        {!projects.length
          ? <div className="empty"><div className="empty-icon">◫</div><div className="empty-text">No projects yet</div>
              <button className="btn btn-primary" onClick={() => setModal(true)}>+ Create First Project</button></div>
          : <div className="projects-grid">
              {projects.map(p => (
                <div className="project-card" key={p.id} onClick={() => navigate(`/projects/${p.id}`)}>
                  <div className="project-name">{p.name}</div>
                  <div className="project-desc">{p.description || 'No description'}</div>
                  <div className="project-footer">
                    <div className="project-stat"><strong>{p.taskCount}</strong> tasks</div>
                    <div className="project-stat"><strong>{p.memberCount}</strong> members</div>
                    <div className="project-stat text-muted">{formatDate(p.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>

      {modal && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">New Project</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input className="form-input" placeholder="e.g. Marketing Website" value={form.name} onChange={set('name')} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="What is this project about?" value={form.description} onChange={set('description')} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={loading}>Save Project</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

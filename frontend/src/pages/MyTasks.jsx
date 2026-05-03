import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { formatDate, isOverdue, statusLabel, statusClass, priorityClass } from '../utils'

export default function MyTasks() {
  const [tasks, setTasks] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const navigate = useNavigate()

  useEffect(() => { api.get('/dashboard').then(r => setTasks(r.data.myTasks || [])) }, [])

  const filtered = tasks.filter(t =>
    (!statusFilter || t.status === statusFilter) &&
    (!priorityFilter || t.priority === priorityFilter)
  )

  return (
    <>
      <div className="topbar"><div className="page-title">My Tasks</div></div>
      <div className="page-content">
        <div className="flex gap-2 mb-3">
          <select className="form-select" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          <select className="form-select" style={{ width: 150 }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="">All Priority</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="card">
          {!filtered.length
            ? <div className="empty"><div className="empty-icon">✓</div><div className="empty-text">No tasks found</div></div>
            : <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Task</th><th>Project</th><th>Status</th><th>Priority</th><th>Due Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(t => (
                      <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${t.projectId}`)}>
                        <td>{t.title}</td>
                        <td><span style={{ color: 'var(--accent)', fontSize: 12 }}>{t.projectName}</span></td>
                        <td><span className={`badge ${statusClass(t.status)}`}>{statusLabel(t.status)}</span></td>
                        <td><span className={`badge ${priorityClass(t.priority)}`}>{t.priority?.toLowerCase()}</span></td>
                        <td className={isOverdue(t.dueDate, t.status) ? 'text-overdue' : 'text-muted'}>
                          {isOverdue(t.dueDate, t.status) ? '⚠ ' : ''}{formatDate(t.dueDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </div>
      </div>
    </>
  )
}

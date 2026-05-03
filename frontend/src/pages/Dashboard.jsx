import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { formatDate, isOverdue, statusLabel, statusClass, priorityClass } from '../utils'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).catch(() => {})
  }, [])

  if (!data) return <><TopBar title="Dashboard" /><div className="loading">Loading...</div></>

  const { totalTasks, todo, inProgress, done, overdue, projects, recentTasks, overdueTasks } = data

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="page-content">
        <div className="stats-grid">
          {[
            { label: 'Total Tasks', value: totalTasks, sub: `${projects} projects`, cls: 'c-accent' },
            { label: 'To Do', value: todo, sub: 'Pending', cls: '' },
            { label: 'In Progress', value: inProgress, sub: 'Active', cls: 'c-amber' },
            { label: 'Completed', value: done, sub: totalTasks ? `${Math.round(done/totalTasks*100)}% done` : '—', cls: 'c-green' },
            { label: 'Overdue', value: overdue, sub: 'Need attention', cls: 'c-red' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-label">{s.label}</div>
              <div className={`stat-value ${s.cls}`}>{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="two-col">
          <div className="card">
            <div className="card-header"><div className="card-title">Recent Activity</div></div>
            <TaskList tasks={recentTasks} navigate={navigate} showProject />
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">🔥 Overdue Tasks</div></div>
            <TaskList tasks={overdueTasks} navigate={navigate} showProject />
          </div>
        </div>
      </div>
    </>
  )
}

function TaskList({ tasks, navigate, showProject }) {
  if (!tasks?.length) return (
    <div className="empty"><div className="empty-icon">✓</div><div className="empty-text">Nothing here</div></div>
  )
  return tasks.slice(0, 8).map(t => (
    <div key={t.id} className="flex items-center gap-2 mb-2"
      style={{ cursor: 'pointer', padding: '8px', borderRadius: 7, transition: 'background 0.15s' }}
      onClick={() => navigate(`/projects/${t.projectId}`)}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--border)', flexShrink: 0,
        background: t.status === 'DONE' ? 'var(--green)' : 'transparent',
        borderColor: t.status === 'DONE' ? 'var(--green)' : t.status === 'IN_PROGRESS' ? 'var(--accent)' : 'var(--border)'
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          textDecoration: t.status === 'DONE' ? 'line-through' : 'none', color: t.status === 'DONE' ? 'var(--text3)' : 'var(--text)' }}>
          {t.title}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          {showProject && <span style={{ color: 'var(--accent)', fontSize: 11 }}>{t.projectName}</span>}
          {t.dueDate && <span className={isOverdue(t.dueDate, t.status) ? 'text-overdue' : ''} style={{ fontSize: 11 }}>
            {isOverdue(t.dueDate, t.status) ? '⚠ ' : ''}{formatDate(t.dueDate)}
          </span>}
          <span className={`badge ${priorityClass(t.priority)}`}>{t.priority?.toLowerCase()}</span>
        </div>
      </div>
    </div>
  ))
}

function TopBar({ title }) {
  return <div className="topbar"><div className="page-title">{title}</div></div>
}

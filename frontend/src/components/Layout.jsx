import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { initials } from '../utils'
import { useState } from 'react'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">⚡</div>
          <div className="logo-text">TaskFlow</div>
        </div>

        <div className="nav-section" style={{ marginTop: 8 }}>
          <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="nav-icon">▦</span> Dashboard
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="nav-icon">◫</span> Projects
          </NavLink>
          <NavLink to="/my-tasks" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <span className="nav-icon">✓</span> My Tasks
          </NavLink>
        </div>

        {user?.role === 'ADMIN' && (
          <div className="nav-section" style={{ marginTop: 8 }}>
            <div className="nav-label">Admin</div>
            <NavLink to="/team" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon">◉</span> Team
            </NavLink>
          </div>
        )}

        <div className="sidebar-footer">
          <div className="user-card" onClick={handleLogout} title="Logout">
            <div className="avatar">{initials(user?.name)}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <span style={{ marginLeft: 'auto', color: 'var(--text3)', fontSize: 12 }}>↪</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}

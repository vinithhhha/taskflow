import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handle = async () => {
    setError(''); setLoading(true)
    try {
      if (tab === 'login') await login(form.email, form.password)
      else await signup(form.name, form.email, form.password, form.role)
      navigate('/')
    } catch (e) { setError(typeof e === 'string' ? e : 'Something went wrong') }
    finally { setLoading(false) }
  }

  const onKey = e => { if (e.key === 'Enter') handle() }

  return (
    <div className="auth-screen">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="logo-icon">⚡</div>
          <div className="auth-logo-text">TaskFlow</div>
        </div>
        <div className="auth-title">{tab === 'login' ? 'Welcome back' : 'Create account'}</div>
        <div className="auth-sub">{tab === 'login' ? 'Sign in to your workspace' : 'Start managing your team'}</div>

        <div className="tabs">
          <button className={`tab-btn${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError('') }}>Login</button>
          <button className={`tab-btn${tab === 'signup' ? ' active' : ''}`} onClick={() => { setTab('signup'); setError('') }}>Sign Up</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {tab === 'signup' && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="John Doe" value={form.name} onChange={set('name')} onKeyDown={onKey} />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input type="email" className="form-input" placeholder="you@company.com" value={form.email} onChange={set('email')} onKeyDown={onKey} />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input type="password" className="form-input" placeholder="••••••••" value={form.password} onChange={set('password')} onKeyDown={onKey} />
        </div>

        {tab === 'signup' && (
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={form.role} onChange={set('role')}>
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        )}

        <button className="btn btn-primary btn-full" onClick={handle} disabled={loading}>
          {loading ? 'Please wait...' : tab === 'login' ? 'Sign In →' : 'Create Account →'}
        </button>

        <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
          First registered user is automatically Admin
        </p>
      </div>
    </div>
  )
}

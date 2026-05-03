import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { initials, formatDate, toast } from '../utils'

export default function Team() {
  const [users, setUsers] = useState([])
  const { user: me } = useAuth()

  const load = () => api.get('/users').then(r => setUsers(r.data)).catch(() => {})
  useEffect(() => { load() }, [])

  const changeRole = async (id, newRole) => {
    if (!confirm(`Change role to ${newRole}?`)) return
    try { await api.patch(`/users/${id}/role`, { role: newRole }); toast('Role updated!', 'success'); load() }
    catch (e) { toast(typeof e === 'string' ? e : 'Failed', 'error') }
  }

  const deleteUser = async (id) => {
    if (!confirm('Remove this user?')) return
    try { await api.delete(`/users/${id}`); toast('User removed', 'success'); load() }
    catch (e) { toast(typeof e === 'string' ? e : 'Failed', 'error') }
  }

  return (
    <>
      <div className="topbar"><div className="page-title">Team Management</div></div>
      <div className="page-content">
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar">{initials(u.name)}</div>
                        {u.name}
                      </div>
                    </td>
                    <td className="text-muted">{u.email}</td>
                    <td><span className={`badge badge-${u.role?.toLowerCase()}`}>{u.role}</span></td>
                    <td className="text-muted text-sm">{formatDate(u.createdAt)}</td>
                    <td>
                      {u.id === me?.id
                        ? <span className="text-sm text-muted">You</span>
                        : <div className="td-actions">
                            <button className="btn btn-secondary btn-sm" onClick={() => changeRole(u.id, u.role === 'ADMIN' ? 'MEMBER' : 'ADMIN')}>
                              Make {u.role === 'ADMIN' ? 'Member' : 'Admin'}
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>Remove</button>
                          </div>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}

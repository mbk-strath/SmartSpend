import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { authAPI } from '../services/api'

const formatJoined = date => {
  if (!date) return 'Not available'
  return new Intl.DateTimeFormat('en-KE', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

export default function Profile({ user, onUserChange }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState(user?.username || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const initial = user?.username?.[0]?.toUpperCase() || 'U'

  const showResult = (ok, text) => {
    setMessage(ok ? text : '')
    setError(ok ? '' : text)
  }

  const changeName = async e => {
    e.preventDefault()
    if (!username.trim()) return showResult(false, 'Name cannot be empty.')
    setSavingName(true)
    try {
      const res = await authAPI.updateMe({ username: username.trim() })
      onUserChange?.(res.data)
      showResult(true, 'Name updated.')
    } catch (err) {
      showResult(false, err.response?.data?.detail || 'Could not update name.')
    } finally {
      setSavingName(false)
    }
  }

  const changePassword = async e => {
    e.preventDefault()
    if (!currentPassword || !newPassword) return showResult(false, 'Enter both password fields.')
    setSavingPassword(true)
    try {
      await authAPI.changePassword({ current_password: currentPassword, new_password: newPassword })
      setCurrentPassword('')
      setNewPassword('')
      showResult(true, 'Password changed.')
    } catch (err) {
      showResult(false, err.response?.data?.detail || 'Could not change password.')
    } finally {
      setSavingPassword(false)
    }
  }

  const deleteAccount = async () => {
    if (!confirm('Delete your account and all transactions? This cannot be undone.')) return
    try {
      await authAPI.deleteMe()
      localStorage.removeItem('token')
      onUserChange?.(null)
      navigate('/signup')
    } catch (err) {
      showResult(false, err.response?.data?.detail || 'Could not delete account.')
    }
  }

  return (
    <div className="profile-page" style={{ background: 'var(--bg)', minHeight: '100vh', padding: '40px' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <button className="btn-ghost" onClick={() => navigate('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
          <ArrowBackOutlinedIcon style={{ fontSize: 16 }} /> Dashboard
        </button>

        <div className="card profile-card" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#7c1d2e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, flexShrink: 0 }}>
              {initial}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--burgundy)', marginBottom: 5 }}>Profile</div>
              <h1 style={{ fontSize: 30, color: 'var(--text-primary)', lineHeight: 1.15, overflowWrap: 'anywhere' }}>{user?.username || 'Student'}</h1>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <ProfileRow Icon={PersonOutlineOutlinedIcon} label="Username" value={user?.username || 'Not available'} />
            <ProfileRow Icon={MailOutlineOutlinedIcon} label="Email" value={user?.email || 'Not available'} />
            <ProfileRow Icon={CalendarTodayOutlinedIcon} label="Joined" value={formatJoined(user?.created_at)} />
            <ProfileRow Icon={CheckCircleOutlineOutlinedIcon} label="Status" value={user?.is_active ? 'Active' : 'Inactive'} accent={user?.is_active ? 'var(--green)' : 'var(--text-muted)'} />
          </div>

          {(message || error) && (
            <div style={{ marginTop: 20, padding: '10px 12px', borderRadius: 8, background: message ? 'var(--green-bg)' : 'var(--red-bg)', color: message ? 'var(--green)' : 'var(--red)', fontSize: 13, fontWeight: 600 }}>
              {message || error}
            </div>
          )}

          <form onSubmit={changeName} style={{ marginTop: 26, paddingTop: 22, borderTop: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>Change name</h2>
            <div className="profile-inline-form" style={{ display: 'flex', gap: 10 }}>
              <input className="input-field" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
              <button className="btn-primary" disabled={savingName} style={{ flexShrink: 0, padding: '12px 18px' }}>{savingName ? 'Saving...' : 'Save'}</button>
            </div>
          </form>

          <form onSubmit={changePassword} style={{ marginTop: 24, paddingTop: 22, borderTop: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>Change password</h2>
            <div className="profile-password-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10 }}>
              <input className="input-field" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current password" />
              <input className="input-field" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" />
              <button className="btn-primary" disabled={savingPassword} style={{ padding: '12px 18px' }}>{savingPassword ? 'Saving...' : 'Update'}</button>
            </div>
          </form>

          <div className="profile-delete-row" style={{ marginTop: 24, paddingTop: 22, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 18, marginBottom: 3 }}>Delete account</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Removes your profile and transactions.</p>
            </div>
            <button onClick={deleteAccount} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: 'var(--red)', border: '1.5px solid var(--border)', borderRadius: 9, padding: '10px 14px', fontFamily: 'Rubik, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
              <DeleteOutlineOutlinedIcon style={{ fontSize: 16 }} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileRow({ Icon, label, value, accent = 'var(--text-primary)' }) {
  return (
    <div className="profile-row" style={{ display: 'grid', gridTemplateColumns: '32px 110px 1fr', alignItems: 'center', gap: 12, padding: '13px 0', borderTop: '1px solid var(--border)' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon style={{ fontSize: 16, color: 'var(--text-muted)' }} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: accent, overflowWrap: 'anywhere' }}>{value}</div>
    </div>
  )
}

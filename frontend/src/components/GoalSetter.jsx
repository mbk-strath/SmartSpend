import { useState } from 'react'
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'

const STORAGE_KEY = 'smartspend_goals'
export const loadGoals  = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} } }
export const saveGoals  = g  => localStorage.setItem(STORAGE_KEY, JSON.stringify(g))

export default function GoalSetter({ onClose, currentExpense }) {
  const [goals, setGoals] = useState(loadGoals)
  const [input, setInput] = useState(goals.monthly_limit || '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const updated = { ...goals, monthly_limit: parseFloat(input) || 0 }
    saveGoals(updated); setGoals(updated); setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 800)
  }

  const limit = goals.monthly_limit || 0
  const pct   = limit > 0 ? Math.min((currentExpense / limit) * 100, 100) : 0
  const over  = limit > 0 && currentExpense > limit

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,20,16,0.4)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="anim-up" style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 380, padding: 28, border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--burgundy-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrackChangesOutlinedIcon style={{ fontSize: 18, color: 'var(--burgundy)' }} />
            </div>
            <h3 style={{ fontFamily: 'Rubik, sans-serif', fontSize: 20, fontWeight: 400 }}>Set savings goal</h3>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ width: 30, height: 30, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
            <CloseIcon style={{ fontSize: 16 }} />
          </button>
        </div>

        {limit > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>Current spending</span>
              <span style={{ color: over ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>
                KES {currentExpense.toLocaleString()} / {limit.toLocaleString()}
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-input)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: over ? 'var(--red)' : 'var(--burgundy)', borderRadius: 3, transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: over ? 'var(--red)' : 'var(--green)' }}>
              {over
                ? `Limit reached. KES ${(currentExpense - limit).toLocaleString()} over budget.`
                : `You are on track. KES ${(limit - currentExpense).toLocaleString()} remaining.`}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Monthly spending limit (KES)
          </label>
          <input className="input-field" type="number" min="0" placeholder="e.g. 15000" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} style={{ fontFamily: 'Rubik, sans-serif', fontSize: 18, fontWeight: 600 }} />
        </div>

        <button className="btn-primary" onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
          {saved ? <><CheckIcon style={{ fontSize: 17 }} /> Saved</> : 'Save goal'}
        </button>
      </div>
    </div>
  )
}

export function GoalBanner({ totalExpense }) {
  const goals = loadGoals()
  const limit = goals.monthly_limit || 0
  if (!limit) return null
  const over      = totalExpense > limit
  const pct       = Math.min((totalExpense / limit) * 100, 100)
  const remaining = limit - totalExpense
  return (
    <div style={{ padding: '10px 16px', borderRadius: 10, background: over ? 'var(--red-bg)' : 'var(--green-bg)', border: `1px solid ${over ? 'rgba(184,50,40,0.15)' : 'rgba(42,110,69,0.15)'}`, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: over ? 'var(--red)' : 'var(--green)', marginBottom: 5 }}>
          {over ? 'Limit reached' : 'You are on track'}
        </div>
        <div style={{ height: 4, background: over ? 'rgba(184,50,40,0.15)' : 'rgba(42,110,69,0.15)', borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: over ? 'var(--red)' : 'var(--green)', borderRadius: 2 }} />
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: over ? 'var(--red)' : 'var(--green)', whiteSpace: 'nowrap' }}>
        {over ? `KES ${Math.abs(remaining).toLocaleString()} over` : `KES ${remaining.toLocaleString()} left`}
      </div>
    </div>
  )
}

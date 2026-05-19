import { useState, useEffect } from 'react'
import { Target, X, Check } from 'lucide-react'

const STORAGE_KEY = 'smartspend_goals'

export function loadGoals() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}

export function saveGoals(goals) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
}

export default function GoalSetter({ onClose, currentExpense }) {
  const [goals, setGoals] = useState(loadGoals)
  const [input, setInput] = useState(goals.monthly_limit || '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const updated = { ...goals, monthly_limit: parseFloat(input) || 0 }
    saveGoals(updated)
    setGoals(updated)
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 800)
  }

  const limit = goals.monthly_limit || 0
  const pct = limit > 0 ? Math.min((currentExpense / limit) * 100, 100) : 0
  const over = limit > 0 && currentExpense > limit

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,20,16,0.4)',
      backdropFilter: 'blur(4px)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="anim-up" style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 380,
        padding: 28, border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'var(--burgundy-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Target size={16} color="var(--burgundy)" />
            </div>
            <h3 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 20, fontWeight: 400 }}>
              Set savings goal
            </h3>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ width: 30, height: 30, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} />
          </button>
        </div>

        {limit > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>Current spending</span>
              <span style={{ color: over ? 'var(--red)' : 'var(--green)', fontWeight: 500 }}>
                KES {currentExpense.toLocaleString()} / {limit.toLocaleString()}
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-input)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: over ? 'var(--red)' : 'var(--burgundy)',
                borderRadius: 3, transition: 'width 0.5s ease',
              }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 500, color: over ? 'var(--red)' : 'var(--green)' }}>
              {over
                ? `⚠ Limit reached — KES ${(currentExpense - limit).toLocaleString()} over budget`
                : `✓ You're on track — KES ${(limit - currentExpense).toLocaleString()} remaining`}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
            Monthly spending limit (KES)
          </label>
          <input
            className="input-field"
            type="number"
            min="0"
            placeholder="e.g. 15000"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 15 }}
          />
        </div>

        <button className="btn-primary" onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
          {saved ? <><Check size={14} /> Saved!</> : 'Save goal'}
        </button>
      </div>
    </div>
  )
}

export function GoalBanner({ totalExpense }) {
  const goals = loadGoals()
  const limit = goals.monthly_limit || 0
  if (!limit) return null
  const over = totalExpense > limit
  const pct = Math.min((totalExpense / limit) * 100, 100)
  const remaining = limit - totalExpense

  return (
    <div style={{
      padding: '10px 16px', borderRadius: 10,
      background: over ? 'var(--red-bg)' : 'var(--green-bg)',
      border: `1px solid ${over ? 'rgba(192,57,43,0.15)' : 'rgba(45,122,79,0.15)'}`,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: over ? 'var(--red)' : 'var(--green)', marginBottom: 4 }}>
          {over ? '⚠ Limit reached' : '✓ You\'re on track'}
        </div>
        <div style={{ height: 4, background: over ? 'rgba(192,57,43,0.15)' : 'rgba(45,122,79,0.15)', borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: over ? 'var(--red)' : 'var(--green)', borderRadius: 2 }} />
        </div>
      </div>
      <div style={{ fontSize: 12, color: over ? 'var(--red)' : 'var(--green)', whiteSpace: 'nowrap', fontWeight: 500 }}>
        {over
          ? `KES ${Math.abs(remaining).toLocaleString()} over`
          : `KES ${remaining.toLocaleString()} left`}
      </div>
    </div>
  )
}

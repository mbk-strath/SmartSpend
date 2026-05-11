import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { transactionsAPI } from '../services/api'

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Business', 'Investments', 'Gift', 'Other'],
  expense: ['Food & Dining', 'Transport', 'Housing', 'Entertainment', 'Healthcare', 'Shopping', 'Utilities', 'Education', 'Other'],
}

const defaultForm = {
  title: '',
  amount: '',
  type: 'expense',
  category: '',
  description: '',
  date: new Date().toISOString().slice(0, 16),
}

export default function TransactionForm({ onSuccess, onClose, editData }) {
  const [form, setForm] = useState(editData || defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v, ...(k === 'type' ? { category: '' } : {}) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.amount || !form.category || !form.date) {
      setError('Please fill in all required fields.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = { ...form, amount: parseFloat(form.amount) }
      if (editData?.id) {
        await transactionsAPI.update(editData.id, payload)
      } else {
        await transactionsAPI.create(payload)
      }
      onSuccess()
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(8, 10, 15, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-fade-in-up"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-hover)',
          borderRadius: 20,
          width: '100%',
          maxWidth: 460,
          padding: 28,
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>
            {editData ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Type toggle */}
        <div
          style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-card)', borderRadius: 12,
            padding: 4, marginBottom: 20, gap: 4,
          }}
        >
          {['expense', 'income'].map((t) => (
            <button
              key={t}
              onClick={() => set('type', t)}
              style={{
                padding: '8px 0', borderRadius: 9, border: 'none',
                cursor: 'pointer', fontFamily: 'Syne, sans-serif',
                fontWeight: 600, fontSize: 13, letterSpacing: '0.01em',
                transition: 'all 0.2s',
                background: form.type === t
                  ? t === 'income' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 113, 133, 0.15)'
                  : 'transparent',
                color: form.type === t
                  ? t === 'income' ? 'var(--accent-green)' : 'var(--accent-red)'
                  : 'var(--text-muted)',
                textTransform: 'capitalize',
              }}
            >
              {t === 'income' ? '↑ Income' : '↓ Expense'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Title */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
              Title *
            </label>
            <input
              className="input-field"
              placeholder="e.g. Naivas grocery run"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          {/* Amount */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
              Amount (KES) *
            </label>
            <input
              className="input-field"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 15 }}
            />
          </div>

          {/* Category */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
              Category *
            </label>
            <select className="input-field" value={form.category} onChange={(e) => set('category', e.target.value)}>
              <option value="">Select category</option>
              {CATEGORIES[form.type].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
              Date & Time *
            </label>
            <input
              className="input-field"
              type="datetime-local"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
              Note (optional)
            </label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="Any extra details..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              style={{ resize: 'none' }}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(251, 113, 133, 0.08)',
              border: '1px solid rgba(251, 113, 133, 0.2)',
              color: 'var(--accent-red)', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'Saving…' : editData ? 'Save Changes' : '+ Add Transaction'}
          </button>
        </div>
      </div>
    </div>
  )
}

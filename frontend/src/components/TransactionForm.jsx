import { useState } from 'react'
import { X } from 'lucide-react'
import { transactionsAPI } from '../services/api'

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Business', 'Investments', 'Gift', 'Other'],
  expense: ['Food & Dining', 'Transport', 'Housing', 'Entertainment', 'Healthcare', 'Shopping', 'Utilities', 'Education', 'Books', 'Other'],
}

const defaultForm = {
  title: '', amount: '', type: 'expense', category: '',
  description: '', date: new Date().toISOString().slice(0, 16),
}

export default function TransactionForm({ onSuccess, onClose, editData }) {
  const [form, setForm] = useState(editData || defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v, ...(k === 'type' ? { category: '' } : {}) }))

  const handleSubmit = async () => {
    if (!form.title || !form.amount || !form.category || !form.date) { setError('Please fill all required fields.'); return }
    setLoading(true); setError('')
    try {
      const payload = { ...form, amount: parseFloat(form.amount) }
      if (editData?.id) await transactionsAPI.update(editData.id, payload)
      else await transactionsAPI.create(payload)
      onSuccess()
    } catch(err) { setError(err.response?.data?.detail || 'Something went wrong.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,20,16,0.4)',
      backdropFilter: 'blur(4px)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="anim-up" style={{
        background: '#fff', borderRadius: 18, width: '100%', maxWidth: 440,
        padding: 28, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, fontWeight: 400 }}>
            {editData ? 'Edit transaction' : 'New transaction'}
          </h2>
          <button onClick={onClose} className="btn-ghost" style={{ width: 30, height: 30, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
            <X size={14} />
          </button>
        </div>

        {/* Type toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg-input)', borderRadius: 10, padding: 3, marginBottom: 18, gap: 3 }}>
          {['expense','income'].map(t => (
            <button key={t} onClick={() => set('type', t)} style={{
              padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: form.type === t ? '#fff' : 'transparent',
              color: form.type === t ? (t === 'expense' ? 'var(--red)' : 'var(--green)') : 'var(--text-muted)',
              fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
              boxShadow: form.type === t ? 'var(--shadow-sm)' : 'none',
            }}>
              {t === 'expense' ? '⊖ Expense' : '⊕ Income'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Title *', key: 'title', placeholder: 'e.g. Naivas grocery run', type: 'text' },
            { label: 'Amount (KES) *', key: 'amount', placeholder: '0.00', type: 'number', mono: true },
          ].map(({ label, key, placeholder, type, mono }) => (
            <div key={key}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 500 }}>{label}</label>
              <input className="input-field" type={type} placeholder={placeholder}
                value={form[key]} onChange={e => set(key, e.target.value)}
                style={mono ? { fontFamily: 'JetBrains Mono, monospace', fontSize: 15 } : {}} />
            </div>
          ))}

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Category *</label>
            <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select category</option>
              {CATEGORIES[form.type].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Date & Time *</label>
            <input className="input-field" type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)} style={{ colorScheme: 'light' }}/>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Note (optional)</label>
            <textarea className="input-field" rows={2} placeholder="Any extra details…" value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'none' }}/>
          </div>

          {error && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--red-bg)', color: 'var(--red)', fontSize: 13, border: '1px solid rgba(192,57,43,0.15)' }}>{error}</div>}

          <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: 12, marginTop: 4 }}>
            {loading ? 'Saving…' : editData ? 'Save changes' : '+ Add transaction'}
          </button>
        </div>
      </div>
    </div>
  )
}

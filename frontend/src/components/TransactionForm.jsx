import { useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import { transactionsAPI } from '../services/api'

const CATEGORIES = {
  income:  ['Salary', 'Freelance', 'Business', 'Investments', 'Gift', 'Other'],
  expense: ['Food and Dining', 'Transport', 'Housing', 'Entertainment', 'Healthcare', 'Shopping', 'Utilities', 'Education', 'Books', 'Other'],
}

const defaultForm = {
  title: '', amount: '', type: 'expense', category: '',
  description: '', date: new Date().toISOString().slice(0, 16),
}

export default function TransactionForm({ onSuccess, onClose, editData }) {
  const [form, setForm]     = useState(editData ? { ...editData, date: editData.date?.slice(0,16) } : defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v, ...(k === 'type' ? { category: '' } : {}) }))

  const handleSubmit = async () => {
    if (!form.title || !form.amount || !form.category || !form.date) { setError('Please fill all required fields.'); return }
    setLoading(true); setError('')
    try {
      const payload = { ...form, amount: parseFloat(form.amount) }
      if (editData?.id) await transactionsAPI.update(editData.id, payload)
      else              await transactionsAPI.create(payload)
      onSuccess()
    } catch(err) { setError(err.response?.data?.detail || 'Something went wrong.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,20,16,0.4)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="anim-up" style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 440, maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto', overscrollBehavior: 'contain', padding: 28, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, fontWeight: 400 }}>
            {editData ? 'Edit transaction' : 'New transaction'}
          </h2>
          <button onClick={onClose} className="btn-ghost" style={{ width: 30, height: 30, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
            <CloseIcon style={{ fontSize: 16 }} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg-input)', borderRadius: 11, padding: 3, marginBottom: 20, gap: 3 }}>
          {['expense', 'income'].map(t => (
            <button key={t} onClick={() => set('type', t)} style={{ padding: '9px', borderRadius: 9, border: 'none', cursor: 'pointer', background: form.type === t ? '#fff' : 'transparent', color: form.type === t ? (t === 'expense' ? 'var(--red)' : 'var(--green)') : 'var(--text-muted)', fontSize: 14, fontWeight: 600, transition: 'all 0.15s', boxShadow: form.type === t ? 'var(--shadow-sm)' : 'none', textTransform: 'capitalize' }}>
              {t === 'expense' ? 'Expense' : 'Income'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Title', key: 'title', placeholder: 'e.g. Naivas grocery run', type: 'text' },
            { label: 'Amount (KES)', key: 'amount', placeholder: '0.00', type: 'number', mono: true },
          ].map(({ label, key, placeholder, type, mono }) => (
            <div key={key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
              <input className="input-field" type={type} placeholder={placeholder} value={form[key]} onChange={e => set(key, e.target.value)}
                style={mono ? { fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 600 } : {}} />
            </div>
          ))}

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</label>
            <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select category</option>
              {CATEGORIES[form.type].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date and Time</label>
            <input className="input-field" type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)} style={{ colorScheme: 'light' }} />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Note (optional)</label>
            <textarea className="input-field" rows={2} placeholder="Any extra details" value={form.description} onChange={e => set('description', e.target.value)} style={{ resize: 'none' }} />
          </div>

          {error && <div style={{ padding: '11px 15px', borderRadius: 9, background: 'var(--red-bg)', color: 'var(--red)', fontSize: 14, border: '1px solid rgba(184,50,40,0.15)' }}>{error}</div>}

          <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px', borderRadius: 12, marginTop: 4 }}>
            {loading ? <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              : <><AddIcon style={{ fontSize: 18 }} />{editData ? 'Save changes' : 'Add transaction'}</>}
          </button>
        </div>
      </div>
    </div>
  )
}

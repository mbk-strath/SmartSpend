import { useState } from 'react'
import { X, ArrowRight } from 'lucide-react'
import api from '../services/api'

const MpesaLogo = () => (
  <svg width="72" height="24" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="40" rx="6" fill="#00A550"/>
    <text x="8" y="27" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="19" fill="white">M-PESA</text>
  </svg>
)

export default function MpesaPay({ onClose, onSuccess }) {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Shopping')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const CATEGORIES = ['Food & Dining', 'Transport', 'Shopping', 'Utilities', 'Healthcare', 'Entertainment', 'Other']

  const formatPhone = (v) => {
    v = v.replace(/\s+/g, '')
    if (v.startsWith('0')) return '254' + v.slice(1)
    if (v.startsWith('+')) return v.slice(1)
    return v
  }

  const handleSend = async () => {
    if (!phone || !amount) { setError('Phone and amount are required.'); return }
    setLoading(true); setError('')
    try {
      const res = await api.post('/mpesa/pay', {
        phone: formatPhone(phone),
        amount: parseInt(amount),
        category,
        title: `M-Pesa – ${category}`,
      })
      if (res.data.ResponseCode === '0') {
        setStep(2)
      } else {
        setError(res.data.ResponseDescription || 'M-Pesa request failed.')
      }
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not reach M-Pesa. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(26,20,16,0.45)',
      backdropFilter: 'blur(5px)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="anim-up" style={{
        background: '#fff', borderRadius: 18, width: '100%', maxWidth: 400,
        overflow: 'hidden', boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--burgundy-deep), var(--burgundy))',
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ marginBottom: 6 }}><MpesaLogo /></div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Lipa Na M-Pesa · STK Push</div>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}><X size={14} /></button>
        </div>

        <div style={{ padding: 24 }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Phone number</label>
                <input className="input-field" placeholder="07XX XXX XXX" value={phone} onChange={e => setPhone(e.target.value)}
                  style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }} />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Sandbox: use 254708374149</div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Amount (KES)</label>
                <input className="input-field" type="number" min="1" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)}
                  style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 500 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 500 }}>Category</label>
                <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              {error && <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--red-bg)', color: 'var(--red)', fontSize: 13, border: '1px solid rgba(192,57,43,0.15)' }}>{error}</div>}
              {phone && amount && (
                <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-input)', border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
                  Sending <strong style={{ color: 'var(--text-primary)' }}>KES {parseInt(amount||0).toLocaleString()}</strong> to{' '}
                  <strong style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-primary)', fontSize: 12 }}>{formatPhone(phone)}</strong>
                </div>
              )}
              <button className="btn-primary" onClick={handleSend} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: 12 }}>
                {loading
                  ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Sending…</>
                  : <>Send STK Push <ArrowRight size={14} /></>}
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid var(--bg-input)', borderTop: '3px solid var(--burgundy)', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
              <h3 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, fontWeight: 400, marginBottom: 8 }}>Check your phone</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
                An M-Pesa prompt has been sent to{' '}
                <strong style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-primary)' }}>{formatPhone(phone)}</strong>.<br />
                Enter your PIN to complete the payment.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '10px 16px', borderRadius: 10, background: 'rgba(0,165,80,0.06)', border: '1px solid rgba(0,165,80,0.2)', marginBottom: 20, fontSize: 13, color: '#007a3d' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00A550', animation: 'mpesa-pulse 1.5s infinite' }} />
                Waiting for PIN confirmation…
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-outline" onClick={() => setStep(1)} style={{ flex: 1 }}>Back</button>
                <button className="btn-primary" onClick={() => { onSuccess?.(); onClose() }} style={{ flex: 1, justifyContent: 'center' }}>Done</button>
              </div>
              <p style={{ marginTop: 14, fontSize: 11, color: 'var(--text-muted)' }}>Transaction appears in dashboard once Safaricom confirms.</p>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes mpesa-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  )
}

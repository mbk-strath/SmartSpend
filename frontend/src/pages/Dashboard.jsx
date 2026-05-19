import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Target, Smartphone, ChevronRight } from 'lucide-react'
import { analyticsAPI, transactionsAPI } from '../services/api'
import { format, startOfWeek, addWeeks } from 'date-fns'
import TransactionForm from '../components/TransactionForm'
import MpesaPay from '../components/MpesaPay'
import GoalSetter, { GoalBanner, loadGoals } from '../components/GoalSetter'
import { CashflowChart, WeeklyBarChart } from '../components/Charts'

const CATS_EXPENSE = ['Food & Dining', 'Transport', 'Rent', 'Books', 'Health', 'Fun', 'Utilities', 'Other']
const CATS_INCOME  = ['Salary', 'Freelance', 'Business', 'Investments', 'Gift', 'Other']

const CAT_ICONS = {
  'Food & Dining': '🍽', 'Transport': '🚌', 'Rent': '🏠', 'Books': '📚',
  'Health': '💊', 'Fun': '🎬', 'Utilities': '⚡', 'Shopping': '🛍',
  'Salary': '💼', 'Freelance': '💻', 'Business': '📈', 'Investments': '📊',
  'Gift': '🎁', 'Other': '📌', 'M-Pesa': '📱', 'Healthcare': '💊', 'Entertainment': '🎬',
}

const amtColor = (type) => type === 'income' ? 'var(--green)' : 'var(--red)'

export default function Dashboard({ user }) {
  const [summary, setSummary]       = useState(null)
  const [transactions, setTxs]      = useState([])
  const [trend, setTrend]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [showMpesa, setShowMpesa]   = useState(false)
  const [showGoal, setShowGoal]     = useState(false)
  const [editTx, setEditTx]         = useState(null)
  // Quick entry state
  const [qType, setQType]           = useState('expense')
  const [qAmount, setQAmount]       = useState('')
  const [qCat, setQCat]             = useState('')
  const [qNote, setQNote]           = useState('')
  const [qLoading, setQLoading]     = useState(false)
  const now = new Date()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [sumRes, txRes, trendRes] = await Promise.all([
        analyticsAPI.summary({ year: now.getFullYear(), month: now.getMonth() + 1 }),
        transactionsAPI.list({ limit: 8 }),
        analyticsAPI.monthlyTrend({ year: now.getFullYear() }),
      ])
      setSummary(sumRes.data)
      setTxs(txRes.data)
      setTrend(trendRes.data)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const handleQuickAdd = async () => {
    if (!qAmount || !qCat) return
    setQLoading(true)
    try {
      await transactionsAPI.create({
        title: qNote || qCat,
        amount: parseFloat(qAmount),
        type: qType,
        category: qCat,
        description: qNote,
        date: new Date().toISOString(),
      })
      setQAmount(''); setQCat(''); setQNote('')
      load()
    } catch(e) { console.error(e) }
    finally { setQLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    await transactionsAPI.delete(id)
    load()
  }

  // Build weekly data from trend
  const weeklyData = [
    { week: 'W1', expense: 0 }, { week: 'W2', expense: 0 },
    { week: 'W3', expense: 0 }, { week: 'W4', expense: 0 },
  ]

  const goals = loadGoals()
  const limit = goals.monthly_limit || 0
  const totalExpense = summary?.total_expense || 0
  const savingsPct = summary?.total_income
    ? Math.round(((summary.total_income - totalExpense) / summary.total_income) * 100)
    : 0

  const heroMsg = () => {
    if (!summary) return { msg: 'Loading your data…', sub: '' }
    if (limit > 0 && totalExpense > limit)
      return { msg: "You've hit your spending limit.", sub: `You're ${formatKES(totalExpense - limit)} over budget this month. Review your expenses.` }
    if (savingsPct >= 30)
      return { msg: "You're on track this month.", sub: `You've saved ${savingsPct}% of your income. Keep going — small wins compound.` }
    if (totalExpense === 0)
      return { msg: 'Welcome to SmartSpend.', sub: 'Log your first transaction to start tracking your spending.' }
    return { msg: "You're doing well.", sub: `KES ${formatKES(summary?.net_balance)} net balance this month. Keep logging your expenses.` }
  }

  const formatKES = (n) => (n || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 })
  const { msg, sub } = heroMsg()

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '20px 20px 40px' }}>

      {/* ── Hero Banner ── */}
      <div className="anim-up" style={{
        background: 'linear-gradient(135deg, var(--burgundy-deep) 0%, var(--burgundy) 55%, #a84832 100%)',
        borderRadius: 18, padding: '32px 36px', marginBottom: 20,
        position: 'relative', overflow: 'hidden', color: '#fff',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, pointerEvents: 'none' }} />

        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>
          WELCOME BACK, {(user?.username || 'there').toUpperCase()}
        </div>
        <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 36, fontWeight: 400, lineHeight: 1.15, marginBottom: 10, maxWidth: 520 }}>
          {msg.includes('on track') ? (
            <>You're <span style={{ borderBottom: '2px solid rgba(255,255,255,0.8)' }}>on track</span> this month.</>
          ) : msg}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 22, maxWidth: 420, lineHeight: 1.6 }}>{sub}</p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowGoal(true)} style={{
            padding: '9px 18px', borderRadius: 20, border: '1.5px solid rgba(255,255,255,0.35)',
            background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Target size={13} /> Set a savings goal
          </button>
          <button onClick={() => setShowForm(true)} style={{
            padding: '9px 18px', borderRadius: 20, border: '1.5px solid rgba(255,255,255,0.35)',
            background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer',
            fontSize: 13, fontWeight: 500, backdropFilter: 'blur(4px)',
          }}>
            See breakdown
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'BALANCE', value: `KES ${formatKES(summary?.net_balance)}`, sub: summary?.net_balance >= 0 ? 'Positive this month' : 'Negative this month', icon: '💳', green: summary?.net_balance >= 0 },
          { label: 'INCOME', value: `KES ${formatKES(summary?.total_income)}`, sub: `${summary?.transaction_count || 0} transactions`, icon: '📥', green: true },
          { label: 'EXPENSES', value: `KES ${formatKES(summary?.total_expense)}`, sub: limit ? `${Math.round((totalExpense/limit)*100)}% of limit` : 'This month', icon: '📤', green: false },
          { label: 'SAVINGS GOAL', value: limit ? `${savingsPct}%` : '—', sub: limit ? `KES ${formatKES(Math.max(0, limit - totalExpense))} / ${formatKES(limit)}` : 'No goal set', icon: '🎯', green: savingsPct >= 20 },
        ].map(({ label, value, sub: s, icon, green }, i) => (
          <div key={label} className={`card anim-up delay-${i+1}`} style={{ padding: '18px 20px', cursor: label === 'SAVINGS GOAL' ? 'pointer' : 'default' }}
            onClick={label === 'SAVINGS GOAL' ? () => setShowGoal(true) : undefined}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</span>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{icon}</div>
            </div>
            {loading
              ? <div className="skeleton" style={{ height: 26, width: '70%', marginBottom: 6 }} />
              : <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: 'var(--text-primary)', marginBottom: 4 }}>{value}</div>}
            <div style={{ fontSize: 11, color: green ? 'var(--green)' : 'var(--text-muted)' }}>{s}</div>
          </div>
        ))}
      </div>

      {/* ── Goal Banner ── */}
      {limit > 0 && (
        <div className="anim-up" style={{ marginBottom: 20 }}>
          <GoalBanner totalExpense={totalExpense} />
        </div>
      )}

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 16, marginBottom: 16 }}>

        {/* Quick Entry */}
        <div className="card anim-up delay-2" style={{ padding: '22px 24px' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 18, color: 'var(--text-primary)', marginBottom: 2 }}>Quick entry</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Log money in or out in seconds.</div>
          </div>

          {/* Type toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg-input)', borderRadius: 10, padding: 3, marginBottom: 14, gap: 3 }}>
            {['expense','income'].map(t => (
              <button key={t} onClick={() => { setQType(t); setQCat('') }} style={{
                padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: qType === t ? '#fff' : 'transparent',
                color: qType === t ? (t === 'expense' ? 'var(--red)' : 'var(--green)') : 'var(--text-muted)',
                fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
                boxShadow: qType === t ? 'var(--shadow-sm)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}>
                <span style={{ fontSize: 11 }}>{t === 'expense' ? '⊖' : '⊕'}</span>
                {t === 'expense' ? 'Expense' : 'Income'}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, fontWeight: 500 }}>Amount (KES)</div>
            <input className="input-field" type="number" placeholder="0.00"
              value={qAmount} onChange={e => setQAmount(e.target.value)}
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 15 }} />
          </div>

          {/* Category chips */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 500 }}>Category</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(qType === 'expense' ? CATS_EXPENSE : CATS_INCOME).map(c => (
                <button key={c} onClick={() => setQCat(c)} style={{
                  padding: '4px 12px', borderRadius: 20,
                  border: `1.5px solid ${qCat === c ? 'var(--burgundy)' : 'var(--border)'}`,
                  background: qCat === c ? 'var(--burgundy-muted)' : 'transparent',
                  color: qCat === c ? 'var(--burgundy)' : 'var(--text-secondary)',
                  fontSize: 12, cursor: 'pointer', fontWeight: qCat === c ? 500 : 400,
                  transition: 'all 0.1s',
                }}>
                  {CAT_ICONS[c] ? `${CAT_ICONS[c]} ` : ''}{c}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, fontWeight: 500 }}>Note (optional)</div>
            <input className="input-field" placeholder="e.g. Lunch at campus café"
              value={qNote} onChange={e => setQNote(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleQuickAdd()} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={handleQuickAdd} disabled={qLoading || !qAmount || !qCat}
              style={{ flex: 1, justifyContent: 'center', borderRadius: 10 }}>
              {qLoading
                ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                : <><Plus size={14} /> Add transaction</>}
            </button>
            <button onClick={() => setShowMpesa(true)} style={{
              padding: '0 14px', borderRadius: 10, border: '1.5px solid var(--border)',
              background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500,
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#00A550'; e.currentTarget.style.color='#007a3d' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>
              M-Pesa
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card anim-up delay-3" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 18, color: 'var(--text-primary)', marginBottom: 2 }}>Recent transactions</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Your latest activity</div>
            </div>
            <button onClick={() => setShowForm(true)} style={{
              fontSize: 12, color: 'var(--burgundy)', background: 'none', border: 'none',
              cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3,
            }}>
              View all <ChevronRight size={12} />
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />)}
            </div>
          ) : transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              No transactions yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {transactions.map(tx => (
                <div key={tx.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '9px 10px',
                  borderRadius: 10, transition: 'background 0.1s', cursor: 'default',
                  group: true,
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {/* Icon */}
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    background: tx.type === 'income' ? 'var(--green-bg)' : 'var(--red-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  }}>
                    {CAT_ICONS[tx.category] || '📌'}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.category}</div>
                  </div>
                  {/* Amount */}
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: amtColor(tx.type), flexShrink: 0 }}>
                    {tx.type === 'income' ? '+' : '-'}KES {tx.amount.toLocaleString()}
                  </div>
                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button onClick={() => { setEditTx(tx); setShowForm(true) }} className="btn-ghost"
                      style={{ width: 26, height: 26, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>
                      <Pencil size={11} />
                    </button>
                    <button onClick={() => handleDelete(tx.id)} className="btn-ghost"
                      style={{ width: 26, height: 26, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = ''}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        <div className="card anim-up delay-4" style={{ padding: '22px 24px' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: 'Instrument Serif, serif', fontSize: 18, color: 'var(--text-primary)', marginBottom: 2 }}>Overview</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Income vs spending · {now.getFullYear()}</div>
          </div>
          {loading
            ? <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />
            : trend.length ? <CashflowChart data={trend} /> : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No data yet — add some transactions
              </div>
            )}
        </div>
      </div>

      {/* ── Modals ── */}
      {showForm && (
        <TransactionForm
          editData={editTx}
          onClose={() => { setShowForm(false); setEditTx(null) }}
          onSuccess={() => { setShowForm(false); setEditTx(null); load() }}
        />
      )}
      {showMpesa && <MpesaPay onClose={() => setShowMpesa(false)} onSuccess={load} />}
      {showGoal && <GoalSetter onClose={() => setShowGoal(false)} currentExpense={totalExpense} />}
    </div>
  )
}

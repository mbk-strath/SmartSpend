import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Wallet, Activity, Plus, Pencil, Trash2, Search, Filter } from 'lucide-react'
import SummaryCard from '../components/SummaryCard'
import TransactionForm from '../components/TransactionForm'
import { analyticsAPI, transactionsAPI } from '../services/api'
import { format } from 'date-fns'

const CATEGORY_COLORS = {
  'Food & Dining': '#fb7185', 'Transport': '#60a5fa', 'Housing': '#a78bfa',
  'Entertainment': '#fbbf24', 'Healthcare': '#34d399', 'Shopping': '#f97316',
  'Utilities': '#14b8a6', 'Education': '#ec4899', 'Salary': '#34d399',
  'Freelance': '#60a5fa', 'Business': '#a78bfa', 'Investments': '#fbbf24',
  'Gift': '#f97316', 'Other': '#8899a6',
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTx, setEditTx] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [now] = useState(new Date())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [sumRes, txRes] = await Promise.all([
        analyticsAPI.summary({ year: now.getFullYear(), month: now.getMonth() + 1 }),
        transactionsAPI.list({ limit: 50, ...(typeFilter ? { type: typeFilter } : {}) }),
      ])
      setSummary(sumRes.data)
      setTransactions(txRes.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [typeFilter, now])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return
    await transactionsAPI.delete(id)
    load()
  }

  const filtered = transactions.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  )

  const fmt = (n) => `KES ${(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 0 })}`

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
            Dashboard
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
            {format(now, 'MMMM yyyy')} overview
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { setEditTx(null); setShowForm(true) }}
          style={{ display: 'flex', alignItems: 'center', gap: 7 }}
        >
          <Plus size={15} strokeWidth={2.5} />
          Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <div className="animate-fade-in-up stagger-1">
          <SummaryCard
            label="Total Income"
            value={fmt(summary?.total_income)}
            icon={TrendingUp}
            color="green"
            subtitle="This month"
            loading={loading}
          />
        </div>
        <div className="animate-fade-in-up stagger-2">
          <SummaryCard
            label="Total Expenses"
            value={fmt(summary?.total_expense)}
            icon={TrendingDown}
            color="red"
            subtitle="This month"
            loading={loading}
          />
        </div>
        <div className="animate-fade-in-up stagger-3">
          <SummaryCard
            label="Net Balance"
            value={fmt(summary?.net_balance)}
            icon={Wallet}
            color={summary?.net_balance >= 0 ? 'green' : 'red'}
            subtitle="Income − Expenses"
            loading={loading}
          />
        </div>
        <div className="animate-fade-in-up stagger-4">
          <SummaryCard
            label="Transactions"
            value={summary?.transaction_count ?? '—'}
            icon={Activity}
            color="blue"
            subtitle="This month"
            loading={loading}
          />
        </div>
      </div>

      {/* Transactions list */}
      <div
        className="card animate-fade-in-up stagger-5"
        style={{ padding: 24 }}
      >
        {/* List header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
            Transactions
          </h2>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 9, padding: '7px 12px 7px 30px',
                  color: 'var(--text-primary)', fontSize: 13, width: 180, outline: 'none',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Filter */}
            <div style={{ position: 'relative' }}>
              <Filter size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <select
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 9, padding: '7px 28px 7px 30px',
                  color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                  fontFamily: 'DM Sans, sans-serif', appearance: 'none', cursor: 'pointer',
                }}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 52, borderRadius: 10 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 0',
            color: 'var(--text-muted)', fontSize: 14,
          }}>
            {search ? 'No transactions match your search.' : 'No transactions yet. Add one to get started!'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.map((tx) => (
              <div
                key={tx.id}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '12px 14px', borderRadius: 12,
                  background: 'var(--bg-card)',
                  border: '1px solid transparent',
                  transition: 'border-color 0.15s',
                  gap: 14,
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                {/* Category dot */}
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: `${CATEGORY_COLORS[tx.category] || '#8899a6'}18`,
                  border: `1px solid ${CATEGORY_COLORS[tx.category] || '#8899a6'}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15,
                }}>
                  {tx.type === 'income' ? '↑' : '↓'}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {tx.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 8 }}>
                    <span style={{
                      background: `${CATEGORY_COLORS[tx.category] || '#8899a6'}15`,
                      color: CATEGORY_COLORS[tx.category] || '#8899a6',
                      padding: '1px 7px', borderRadius: 4, fontSize: 10, fontWeight: 500,
                    }}>
                      {tx.category}
                    </span>
                    <span>{format(new Date(tx.date), 'dd MMM yyyy')}</span>
                  </div>
                </div>

                {/* Amount */}
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: 14,
                  color: tx.type === 'income' ? 'var(--accent-green)' : 'var(--accent-red)',
                  flexShrink: 0,
                }}>
                  {tx.type === 'income' ? '+' : '-'} KES {tx.amount.toLocaleString()}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => { setEditTx(tx); setShowForm(true) }}
                    style={{
                      width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)',
                      background: 'transparent', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-blue)'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.3)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    style={{
                      width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border)',
                      background: 'transparent', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-red)'; e.currentTarget.style.borderColor = 'rgba(251,113,133,0.3)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <TransactionForm
          editData={editTx}
          onClose={() => { setShowForm(false); setEditTx(null) }}
          onSuccess={() => { setShowForm(false); setEditTx(null); load() }}
        />
      )}
    </div>
  )
}

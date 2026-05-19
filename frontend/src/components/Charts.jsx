import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const fmt = v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(Math.round(v))

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)',
      borderRadius: 10, padding: '10px 14px',
      boxShadow: 'var(--shadow-md)', fontSize: 12,
    }}>
      {label && <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>}
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{p.name}:</span>
          <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontWeight: 500 }}>
            KES {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// Cashflow area chart (income vs spending like screenshot)
export function CashflowChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#b8860b" stopOpacity={0.25}/>
            <stop offset="95%" stopColor="#b8860b" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c1d2e" stopOpacity={0.25}/>
            <stop offset="95%" stopColor="#7c1d2e" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe5" vertical={false}/>
        <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false}/>
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={fmt}/>
        <Tooltip content={<ChartTooltip />}/>
        <Area type="monotone" dataKey="income" stroke="#b8860b" strokeWidth={2} fill="url(#incG)" dot={false} activeDot={{ r: 3, fill: '#b8860b' }}/>
        <Area type="monotone" dataKey="expense" stroke="#7c1d2e" strokeWidth={2} fill="url(#expG)" dot={false} activeDot={{ r: 3, fill: '#7c1d2e' }}/>
      </AreaChart>
    </ResponsiveContainer>
  )
}

// Donut chart - category breakdown
const DONUT_COLORS = ['#7c1d2e','#b8860b','#2d7a4f','#5c8fb5','#c0714a','#6e6b9e','#4a9e7e']

export function DonutChart({ data }) {
  const expenseData = data.filter(d => d.type === 'expense')
  if (!expenseData.length) return (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
      No expense data
    </div>
  )
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={expenseData} dataKey="total" nameKey="category"
          cx="50%" cy="50%" innerRadius={55} outerRadius={82} paddingAngle={2} strokeWidth={0}>
          {expenseData.map((_, i) => (
            <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]}/>
          ))}
        </Pie>
        <Tooltip content={({ active, payload }) => {
          if (!active || !payload?.length) return null
          const d = payload[0]
          return (
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: 'var(--shadow-md)' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>{d.name}</div>
              <div style={{ color: d.payload.fill, fontFamily: 'JetBrains Mono', fontWeight: 600 }}>KES {d.value?.toLocaleString()}</div>
            </div>
          )
        }}/>
      </PieChart>
    </ResponsiveContainer>
  )
}

// Weekly spending bar chart
export function WeeklyBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }} barSize={36}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe5" vertical={false}/>
        <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false}/>
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={fmt}/>
        <Tooltip content={<ChartTooltip />}/>
        <Bar dataKey="expense" fill="#7c1d2e" radius={[5,5,0,0]} fillOpacity={0.85}/>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Keep old ones as aliases for analytics page
export function TrendChart({ data }) { return <CashflowChart data={data} /> }
export function CategoryBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 40 }} barSize={16}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe5" vertical={false}/>
        <XAxis dataKey="category" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} interval={0} angle={-25} textAnchor="end" height={48}/>
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} tickFormatter={fmt}/>
        <Tooltip content={<ChartTooltip />}/>
        <Bar dataKey="total" radius={[5,5,0,0]}>
          {data.map((e,i) => <Cell key={i} fill={e.type === 'income' ? '#2d7a4f' : '#7c1d2e'} fillOpacity={0.85}/>)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
export function SpendingPieChart({ data }) { return <DonutChart data={data} /> }

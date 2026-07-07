import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const fmt = v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v))

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', boxShadow: 'var(--shadow-md)', fontSize: 12 }}>
      {label && <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>}
      {payload.map(p => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{p.name}:</span>
          <span style={{ color: 'var(--text-primary)', fontFamily: 'Rubik, sans-serif', fontWeight: 600 }}>
            KES {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function CashflowChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={210}>
      <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#9a6f00" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#9a6f00" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#7c1d2e" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#7c1d2e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe5" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Rubik' }} tickLine={false} axisLine={false} tickFormatter={fmt} />
        <Tooltip content={<ChartTooltip />} />
        <Area type="monotone" dataKey="income"  stroke="#9a6f00" strokeWidth={2} fill="url(#incG)" dot={false} activeDot={{ r: 4, fill: '#9a6f00' }} />
        <Area type="monotone" dataKey="expense" stroke="#7c1d2e" strokeWidth={2} fill="url(#expG)" dot={false} activeDot={{ r: 4, fill: '#7c1d2e' }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

const DONUT_COLORS = ['#7c1d2e','#9a6f00','#2a6e45','#2b5ea7','#c0714a','#6e6b9e','#4a9e7e','#8b5e3c']

export function DonutChart({ data, type = 'expense' }) {
  const filtered = data.filter(d => d.type === type)
  if (!filtered.length) return (
    <div style={{ height: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No {type} data</div>
  )
  return (
    <ResponsiveContainer width="100%" height={210}>
      <PieChart>
        <Pie data={filtered} dataKey="total" nameKey="category" cx="50%" cy="50%" innerRadius={58} outerRadius={86} paddingAngle={2} strokeWidth={0}>
          {filtered.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
        </Pie>
        <Tooltip content={({ active, payload }) => {
          if (!active || !payload?.length) return null
          const d = payload[0]
          return (
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: 'var(--shadow-md)' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 2 }}>{d.name}</div>
              <div style={{ color: d.payload.fill, fontFamily: 'Rubik, sans-serif', fontWeight: 700 }}>KES {d.value?.toLocaleString()}</div>
            </div>
          )
        }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function WeeklyBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }} barSize={40}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe5" vertical={false} />
        <XAxis dataKey="week" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Rubik' }} tickLine={false} axisLine={false} tickFormatter={fmt} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="expense" fill="#7c1d2e" radius={[5, 5, 0, 0]} fillOpacity={0.85} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TrendChart({ data }) { return <CashflowChart data={data} /> }

export function CategoryBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 40 }} barSize={18}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe5" vertical={false} />
        <XAxis dataKey="category" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} interval={0} angle={-25} textAnchor="end" height={48} />
        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'Rubik' }} tickLine={false} axisLine={false} tickFormatter={fmt} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="total" radius={[5, 5, 0, 0]}>
          {data.map((e, i) => <Cell key={i} fill={e.type === 'income' ? '#2a6e45' : '#7c1d2e'} fillOpacity={0.85} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function SpendingPieChart({ data }) { return <DonutChart data={data} /> }

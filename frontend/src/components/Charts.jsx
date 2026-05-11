import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const fmt = (v) =>
  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)

const CustomTooltip = ({ active, payload, label, prefix = 'KES ' }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-hover)',
      borderRadius: 10,
      padding: '10px 14px',
      fontFamily: 'DM Sans, sans-serif',
      fontSize: 13,
    }}>
      {label && <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontSize: 12 }}>{label}</div>}
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{p.name}:</span>
          <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500 }}>
            {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export function TrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#fb7185" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="month"
          tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'DM Sans' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={fmt}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, fontFamily: 'DM Sans', color: 'var(--text-secondary)', paddingTop: 12 }}
        />
        <Area type="monotone" dataKey="income" stroke="#34d399" strokeWidth={2} fill="url(#incomeGrad)" dot={false} activeDot={{ r: 4, fill: '#34d399' }} />
        <Area type="monotone" dataKey="expense" stroke="#fb7185" strokeWidth={2} fill="url(#expenseGrad)" dot={false} activeDot={{ r: 4, fill: '#fb7185' }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function CategoryBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barSize={18} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="category"
          tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'DM Sans' }}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={40}
        />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={fmt}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.type === 'income' ? '#34d399' : '#fb7185'} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

const PIE_COLORS = ['#34d399', '#fb7185', '#fbbf24', '#60a5fa', '#a78bfa', '#f97316', '#ec4899', '#14b8a6']

export function SpendingPieChart({ data }) {
  const expenseData = data.filter((d) => d.type === 'expense')

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={expenseData}
          dataKey="total"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          strokeWidth={0}
        >
          {expenseData.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} fillOpacity={0.9} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0]
            return (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-hover)',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 13,
              }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{d.name}</div>
                <div style={{ color: d.payload.fill, fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
                  KES {d.value?.toLocaleString()}
                </div>
              </div>
            )
          }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'DM Sans' }}>{value}</span>
          )}
          wrapperStyle={{ paddingTop: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

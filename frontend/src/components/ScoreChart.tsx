import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export interface ScoreDataPoint {
  label: string
  score: number
}

interface ScoreChartProps {
  data: ScoreDataPoint[]
  height?: number
}

export default function ScoreChart({ data, height = 220 }: ScoreChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg"
        style={{
          height,
          backgroundColor: 'var(--color-surface-2)',
          color: 'var(--color-text-muted)',
          border: '1px solid var(--color-border)',
        }}
      >
        No attestation data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#f7931a" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#f7931a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-surface-2)',
            borderColor: 'var(--color-border)',
            borderRadius: 8,
            color: 'var(--color-text-primary)',
          }}
          labelStyle={{ color: 'var(--color-text-secondary)', marginBottom: 4 }}
          cursor={{ stroke: 'var(--color-btc)', strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#f7931a"
          strokeWidth={2}
          fill="url(#scoreGrad)"
          dot={{ r: 3, fill: '#f7931a', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#f7931a' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

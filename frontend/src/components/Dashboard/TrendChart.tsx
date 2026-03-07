import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface MonthlyDataPoint {
  month: string;
  income: number;
  expense: number;
}

interface TrendChartProps {
  data: MonthlyDataPoint[];
}

export function TrendChart({ data }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        No trend data available
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
        <Tooltip
          formatter={(value) => `$${Number(value).toFixed(2)}`}
          contentStyle={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          stroke="var(--color-success)"
          strokeWidth={2}
          dot={{ r: 4 }}
          name="Income"
        />
        <Line
          type="monotone"
          dataKey="expense"
          stroke="var(--color-danger)"
          strokeWidth={2}
          dot={{ r: 4 }}
          name="Expenses"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

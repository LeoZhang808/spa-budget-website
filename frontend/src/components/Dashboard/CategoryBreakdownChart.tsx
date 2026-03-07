import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface CategorySlice {
  name: string;
  value: number;
}

interface CategoryBreakdownChartProps {
  data: CategorySlice[];
}

const COLORS = [
  '#6366f1',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#06b6d4',
  '#84cc16',
];

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
        No spending data
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) =>
            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {data.map((_entry, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

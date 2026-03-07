import { useState, useEffect, useCallback } from 'react';
import { getSummary, getAnalytics } from '../../api/dashboardClient';
import type { SummaryData, AnalyticsData } from '../../api/dashboardClient';
import { formatCents } from '../../utils/formatCurrency';
import { formatMonth, getCurrentMonth } from '../../utils/formatDate';
import { TrendChart } from '../../components/Dashboard/TrendChart';
import { CategoryBreakdownChart } from '../../components/Dashboard/CategoryBreakdownChart';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import './Dashboard.css';

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getAnalyticsRange(month: string): { from: string; to: string } {
  const to = month;
  const from = shiftMonth(month, -5);
  return { from, to };
}

export function DashboardPage() {
  const [month, setMonth] = useState(getCurrentMonth);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { from, to } = getAnalyticsRange(month);
      const [s, a] = await Promise.all([
        getSummary(month),
        getAnalytics(from, to),
      ]);
      setSummary(s);
      setAnalytics(a);
    } catch (err) {
      console.error('Dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <LoadingSpinner />;

  const trendData =
    analytics?.trend.map((m) => ({
      month: m.month,
      income: 0,
      expense: m.total_spent_cents / 100,
    })) ?? [];

  const categoryData =
    analytics?.by_category.map((c) => ({
      name: c.category_name,
      value: c.spent_cents / 100,
    })) ?? [];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <div className="month-selector">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
          >
            ‹
          </button>
          <span className="month-label">{formatMonth(month)}</span>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
          >
            ›
          </button>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <span className="summary-label">Total Budget</span>
          <span className="summary-value">
            {formatCents(summary?.total_budget_cents ?? 0)}
          </span>
        </div>
        <div className="summary-card summary-card--danger">
          <span className="summary-label">Total Spent</span>
          <span className="summary-value">
            {formatCents(summary?.total_spent_cents ?? 0)}
          </span>
        </div>
        <div className="summary-card summary-card--primary">
          <span className="summary-label">Remaining</span>
          <span className="summary-value">
            {formatCents(summary?.remaining_cents ?? 0)}
          </span>
        </div>
        <div className="summary-card summary-card--success">
          <span className="summary-label">Total Income</span>
          <span className="summary-value">
            {formatCents(summary?.total_income_cents ?? 0)}
          </span>
        </div>
      </div>

      {summary?.by_category && summary.by_category.length > 0 && (
        <div className="card">
          <h2 className="card-title">Budget by Category</h2>
          <div className="category-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Budget</th>
                  <th>Spent</th>
                  <th>Remaining</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {summary.by_category.map((c) => {
                  const pct =
                    c.budget_cents > 0
                      ? Math.min(100, (c.spent_cents / c.budget_cents) * 100)
                      : 0;
                  const over = c.spent_cents > c.budget_cents;
                  const remaining = c.budget_cents - c.spent_cents;
                  return (
                    <tr key={c.category_id}>
                      <td>{c.category_name}</td>
                      <td>{formatCents(c.budget_cents)}</td>
                      <td>{formatCents(c.spent_cents)}</td>
                      <td
                        className={
                          remaining < 0 ? 'text-danger' : 'text-success'
                        }
                      >
                        {formatCents(remaining)}
                      </td>
                      <td>
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${over ? 'progress-fill--over' : ''}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="charts-row">
        <div className="card chart-card">
          <h2 className="card-title">Monthly Trend</h2>
          <TrendChart data={trendData} />
        </div>
        <div className="card chart-card">
          <h2 className="card-title">Spending by Category</h2>
          <CategoryBreakdownChart data={categoryData} />
        </div>
      </div>
    </div>
  );
}

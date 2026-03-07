import client from './client';

export interface SummaryData {
  month: string;
  total_budget_cents: number;
  total_spent_cents: number;
  remaining_cents: number;
  total_income_cents: number;
  by_category: {
    category_id: number;
    category_name: string;
    budget_cents: number;
    spent_cents: number;
  }[];
}

export interface AnalyticsData {
  trend: {
    month: string;
    total_spent_cents: number;
  }[];
  by_category: {
    category_id: number;
    category_name: string;
    spent_cents: number;
  }[];
}

export async function getSummary(month?: string): Promise<SummaryData> {
  const resp = await client.get('/dashboard/summary', {
    params: month ? { month } : undefined,
  });
  return resp.data.data;
}

export async function getAnalytics(
  from: string,
  to: string,
): Promise<AnalyticsData> {
  const resp = await client.get('/dashboard/analytics', {
    params: { from, to },
  });
  return resp.data.data;
}

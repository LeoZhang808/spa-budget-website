import client from './client';

export interface Budget {
  id: number;
  category_id: number;
  category_name: string | null;
  amount_cents: number;
  month: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetInput {
  category_id: number | string;
  amount_cents: number;
  month: string;
}

export async function listBudgets(month?: string): Promise<Budget[]> {
  const resp = await client.get('/budgets', {
    params: month ? { month } : undefined,
  });
  return resp.data.data;
}

export async function createBudget(input: BudgetInput): Promise<Budget> {
  const resp = await client.post('/budgets', input);
  return resp.data.data;
}

export async function updateBudget(
  id: number | string,
  input: Partial<BudgetInput>,
): Promise<Budget> {
  const resp = await client.patch(`/budgets/${id}`, input);
  return resp.data.data;
}

export async function deleteBudget(id: number | string): Promise<void> {
  await client.delete(`/budgets/${id}`);
}

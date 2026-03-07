import client from './client';

export interface Transaction {
  id: number;
  type: 'expense' | 'income';
  amount_cents: number;
  category_id: number;
  category_name: string | null;
  transaction_date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionListResponse {
  data: Transaction[];
  meta: { page: number; limit: number; total: number };
}

export interface TransactionFilters {
  from?: string;
  to?: string;
  category_id?: string | number;
  type?: 'expense' | 'income';
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface TransactionInput {
  type: 'expense' | 'income';
  amount_cents: number;
  category_id: number | string;
  transaction_date: string;
  note?: string;
}

export async function listTransactions(
  params?: TransactionFilters,
): Promise<TransactionListResponse> {
  const resp = await client.get('/transactions', { params });
  return resp.data;
}

export async function getTransaction(
  id: number | string,
): Promise<Transaction> {
  const resp = await client.get(`/transactions/${id}`);
  return resp.data.data;
}

export async function createTransaction(
  input: TransactionInput,
): Promise<Transaction> {
  const resp = await client.post('/transactions', input);
  return resp.data.data;
}

export async function updateTransaction(
  id: number | string,
  input: Partial<TransactionInput>,
): Promise<Transaction> {
  const resp = await client.patch(`/transactions/${id}`, input);
  return resp.data.data;
}

export async function deleteTransaction(id: number | string): Promise<void> {
  await client.delete(`/transactions/${id}`);
}

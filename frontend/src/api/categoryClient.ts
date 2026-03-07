import client from './client';

export interface Category {
  id: number;
  name: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export async function listCategories(): Promise<Category[]> {
  const resp = await client.get('/categories');
  return resp.data.data;
}

export async function createCategory(name: string): Promise<Category> {
  const resp = await client.post('/categories', { name });
  return resp.data.data;
}

export async function updateCategory(
  id: number | string,
  name: string,
): Promise<Category> {
  const resp = await client.patch(`/categories/${id}`, { name });
  return resp.data.data;
}

export async function deleteCategory(id: number | string): Promise<void> {
  await client.delete(`/categories/${id}`);
}

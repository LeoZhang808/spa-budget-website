import { z } from 'zod';

export const createBudgetSchema = z.object({
  category_id: z.number().int(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  amount_cents: z.number().int().positive(),
});

export const updateBudgetSchema = z.object({
  amount_cents: z.number().int().positive().optional(),
});

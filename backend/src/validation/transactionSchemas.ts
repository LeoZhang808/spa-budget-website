import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['expense', 'income']),
  amount_cents: z.number().int().positive(),
  category_id: z.number().int(),
  transaction_date: z.string().transform((s) => new Date(s)),
  note: z.string().max(500).optional(),
});

export const updateTransactionSchema = z.object({
  type: z.enum(['expense', 'income']).optional(),
  amount_cents: z.number().int().positive().optional(),
  category_id: z.number().int().optional(),
  transaction_date: z.string().transform((s) => new Date(s)).optional(),
  note: z.string().max(500).optional(),
});

export const transactionQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  category_id: z.coerce.number().int().optional(),
  type: z.enum(['expense', 'income']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['date_asc', 'date_desc', 'amount_asc', 'amount_desc']).default('date_desc'),
});

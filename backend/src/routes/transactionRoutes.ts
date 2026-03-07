import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { transactionService } from '../services/transactionService';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
} from '../validation/transactionSchemas';
import { AppError } from '../middleware/errorHandler';
import { toTransactionResponse } from '../utils/transform';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  const parsed = transactionQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION', 'Invalid query parameters', parsed.error.issues);
  }

  const result = await transactionService.listTransactions(req.userId!, parsed.data);
  res.json({ data: result.data.map(toTransactionResponse), meta: result.meta });
});

router.post('/', async (req: Request, res: Response) => {
  const parsed = createTransactionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION', 'Invalid input', parsed.error.issues);
  }

  const transaction = await transactionService.createTransaction(req.userId!, parsed.data);
  res.status(201).json({ data: toTransactionResponse(transaction) });
});

router.get('/:id', async (req: Request, res: Response) => {
  const transaction = await transactionService.getTransaction(
    req.userId!,
    Number(req.params.id),
  );
  res.json({ data: toTransactionResponse(transaction) });
});

router.patch('/:id', async (req: Request, res: Response) => {
  const parsed = updateTransactionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION', 'Invalid input', parsed.error.issues);
  }

  const transaction = await transactionService.updateTransaction(
    req.userId!,
    Number(req.params.id),
    parsed.data,
  );
  res.json({ data: toTransactionResponse(transaction) });
});

router.delete('/:id', async (req: Request, res: Response) => {
  await transactionService.deleteTransaction(req.userId!, Number(req.params.id));
  res.status(204).end();
});

export default router;

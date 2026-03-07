import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { budgetService } from '../services/budgetService';
import { createBudgetSchema, updateBudgetSchema } from '../validation/budgetSchemas';
import { AppError } from '../middleware/errorHandler';
import { toBudgetResponse } from '../utils/transform';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  const month = req.query.month as string | undefined;
  const budgets = await budgetService.listBudgets(req.userId!, month);
  res.json({ data: budgets.map(toBudgetResponse) });
});

router.post('/', async (req: Request, res: Response) => {
  const parsed = createBudgetSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION', 'Invalid input', parsed.error.issues);
  }

  const budget = await budgetService.createBudget(req.userId!, parsed.data);
  res.status(201).json({ data: toBudgetResponse(budget) });
});

router.patch('/:id', async (req: Request, res: Response) => {
  const parsed = updateBudgetSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION', 'Invalid input', parsed.error.issues);
  }

  const budget = await budgetService.updateBudget(
    req.userId!,
    Number(req.params.id),
    parsed.data,
  );
  res.json({ data: toBudgetResponse(budget) });
});

router.delete('/:id', async (req: Request, res: Response) => {
  await budgetService.deleteBudget(req.userId!, Number(req.params.id));
  res.status(204).end();
});

export default router;

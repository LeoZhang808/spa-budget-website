import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { categoryService } from '../services/categoryService';
import { createCategorySchema, updateCategorySchema } from '../validation/categorySchemas';
import { AppError } from '../middleware/errorHandler';
import { toCategoryResponse } from '../utils/transform';

const router = Router();

router.use(authenticate);

router.get('/', async (req: Request, res: Response) => {
  const categories = await categoryService.listCategories(req.userId!);
  res.json({ data: categories.map(toCategoryResponse) });
});

router.post('/', async (req: Request, res: Response) => {
  const parsed = createCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION', 'Invalid input', parsed.error.issues);
  }

  const category = await categoryService.createCategory(req.userId!, parsed.data.name);
  res.status(201).json({ data: toCategoryResponse(category) });
});

router.patch('/:id', async (req: Request, res: Response) => {
  const parsed = updateCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION', 'Invalid input', parsed.error.issues);
  }

  if (!parsed.data.name) {
    throw new AppError(400, 'VALIDATION', 'No fields to update');
  }

  const category = await categoryService.updateCategory(
    req.userId!,
    Number(req.params.id),
    parsed.data.name,
  );
  res.json({ data: toCategoryResponse(category) });
});

router.delete('/:id', async (req: Request, res: Response) => {
  await categoryService.deleteCategory(req.userId!, Number(req.params.id));
  res.status(204).end();
});

export default router;

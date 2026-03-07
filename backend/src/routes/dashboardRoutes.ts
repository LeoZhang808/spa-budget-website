import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { dashboardService } from '../services/dashboardService';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

router.get('/summary', async (req: Request, res: Response) => {
  const month = req.query.month as string | undefined;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    throw new AppError(400, 'VALIDATION', 'month query parameter required in YYYY-MM format');
  }

  const summary = await dashboardService.getSummary(req.userId!, month);
  res.json({ data: summary });
});

router.get('/analytics', async (req: Request, res: Response) => {
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;

  if (!from || !to || !/^\d{4}-\d{2}$/.test(from) || !/^\d{4}-\d{2}$/.test(to)) {
    throw new AppError(
      400,
      'VALIDATION',
      'from and to query parameters required in YYYY-MM format',
    );
  }

  const analytics = await dashboardService.getAnalytics(req.userId!, from, to);
  res.json({ data: analytics });
});

export default router;

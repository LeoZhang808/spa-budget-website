import { Router, Request, Response } from 'express';
import { prisma } from '../config/database';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

router.get('/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready' });
  }
});

export default router;

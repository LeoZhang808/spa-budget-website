import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { authRateLimiter } from '../middleware/rateLimit';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { registerSchema, loginSchema, updateProfileSchema } from '../validation/authSchemas';
import { AppError } from '../middleware/errorHandler';
import { toUserResponse } from '../utils/transform';

const router = Router();

router.post('/register', authRateLimiter, async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION', 'Invalid input', parsed.error.issues);
  }

  const user = await authService.register(
    parsed.data.email,
    parsed.data.password,
    req,
    res,
    parsed.data.display_name,
  );
  res.status(201).json({ data: toUserResponse(user) });
});

router.post('/login', authRateLimiter, async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION', 'Invalid input', parsed.error.issues);
  }

  const user = await authService.login(parsed.data.email, parsed.data.password, req, res);
  res.json({ data: toUserResponse(user) });
});

router.post('/logout', authenticate, async (_req: Request, res: Response) => {
  authService.logout(res);
  res.json({ data: { message: 'Logged out' } });
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.userId!);
  res.json({ data: toUserResponse(user) });
});

router.patch('/me', authenticate, async (req: Request, res: Response) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'VALIDATION', 'Invalid input', parsed.error.issues);
  }

  const user = await profileService.updateProfile(req.userId!, parsed.data);
  res.json({ data: toUserResponse(user) });
});

export default router;

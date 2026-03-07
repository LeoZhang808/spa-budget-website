import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, verifyRefreshToken, createAccessToken, setAuthCookies } from '../auth/jwt';
import { AppError } from './errorHandler';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const accessToken = req.cookies?.access_token;
  const refreshToken = req.cookies?.refresh_token;

  if (accessToken) {
    try {
      const payload = verifyAccessToken(accessToken);
      req.userId = payload.userId;
      next();
      return;
    } catch {
      // access token expired — fall through to try refresh
    }
  }

  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const newAccessToken = createAccessToken(payload.userId);
      setAuthCookies(_res, newAccessToken, refreshToken);
      req.userId = payload.userId;
      next();
      return;
    } catch {
      // refresh token also invalid
    }
  }

  throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
}

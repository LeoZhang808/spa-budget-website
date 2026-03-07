import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env';

interface TokenPayload {
  userId: number;
}

export function createAccessToken(userId: number): string {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '24h' });
}

export function createRefreshToken(userId: number): string {
  return jwt.sign({ userId }, env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as TokenPayload;
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  const isProduction = env.NODE_ENV === 'production';

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24h
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
}

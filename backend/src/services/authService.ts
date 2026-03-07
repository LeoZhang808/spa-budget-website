import { Response } from 'express';
import { userRepository } from '../repositories/userRepository';
import { hashPassword, verifyPassword } from '../auth/password';
import { createAccessToken, createRefreshToken, setAuthCookies, clearAuthCookies } from '../auth/jwt';
import { categoryService } from './categoryService';
import { AppError } from '../middleware/errorHandler';

export const authService = {
  async register(
    email: string,
    password: string,
    res: Response,
    displayName?: string,
  ) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError(409, 'CONFLICT', 'Email already registered');
    }

    const passwordHash = await hashPassword(password);
    const user = await userRepository.create({ email, passwordHash, displayName });

    await categoryService.seedDefaultCategories(user.id);

    const accessToken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);
    setAuthCookies(res, accessToken, refreshToken);

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  async login(email: string, password: string, res: Response) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
    }

    const accessToken = createAccessToken(user.id);
    const refreshToken = createRefreshToken(user.id);
    setAuthCookies(res, accessToken, refreshToken);

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  logout(res: Response) {
    clearAuthCookies(res);
  },

  async getCurrentUser(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }
    return user;
  },
};

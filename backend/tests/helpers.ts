import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-jwt-secret-for-integration-tests';
const REFRESH_SECRET = 'test-refresh-secret-for-integration-tests';

export function createAuthCookies(userId: number): string {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
  return `access_token=${accessToken}; refresh_token=${refreshToken}`;
}

export const TEST_USER = {
  id: 1,
  email: 'test@example.com',
  passwordHash: '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUV',
  displayName: 'Test User',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

export const TEST_CATEGORY = {
  id: 1,
  userId: 1,
  name: 'Food',
  isSystem: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

export const TEST_TRANSACTION = {
  id: 1,
  userId: 1,
  type: 'expense' as const,
  amountCents: 1500,
  categoryId: 1,
  category: { id: 1, name: 'Food' },
  transactionDate: new Date('2026-03-01'),
  note: 'Lunch',
  createdAt: new Date('2026-03-01'),
  updatedAt: new Date('2026-03-01'),
};

export const TEST_BUDGET = {
  id: 1,
  userId: 1,
  categoryId: 1,
  category: { id: 1, name: 'Food' },
  month: new Date('2026-03-01'),
  amountCents: 50000,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

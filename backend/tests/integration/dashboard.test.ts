import request from 'supertest';
import app from '../../src/app';
import { prismaMock } from '../mocks/database';
import { createAuthCookies } from '../helpers';

jest.mock('../../src/config/database', () => ({
  prisma: require('../mocks/database').prismaMock,
  disconnectDatabase: jest.fn(),
}));

const makeBudget = (categoryId: number, categoryName: string, amountCents: number) => ({
  id: categoryId,
  userId: 1,
  categoryId,
  category: { id: categoryId, name: categoryName },
  month: new Date('2026-03-01'),
  amountCents,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeTransaction = (
  id: number,
  type: 'expense' | 'income',
  amountCents: number,
  categoryId: number,
  categoryName: string,
  date: string,
) => ({
  id,
  userId: 1,
  type,
  amountCents,
  categoryId,
  category: { id: categoryId, name: categoryName },
  transactionDate: new Date(date),
  note: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('Dashboard API', () => {
  const cookies = createAuthCookies(1);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/dashboard/summary', () => {
    it('returns monthly summary with budget, spent, and remaining', async () => {
      prismaMock.budget.findMany.mockResolvedValue([
        makeBudget(1, 'Food', 30000),
        makeBudget(2, 'Transport', 20000),
      ]);
      prismaMock.transaction.findMany.mockResolvedValue([
        makeTransaction(1, 'expense', 12000, 1, 'Food', '2026-03-05'),
        makeTransaction(2, 'expense', 5000, 2, 'Transport', '2026-03-10'),
        makeTransaction(3, 'income', 100000, 1, 'Food', '2026-03-01'),
      ]);

      const res = await request(app)
        .get('/api/v1/dashboard/summary?month=2026-03')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.data.month).toBe('2026-03');
      expect(res.body.data.total_budget_cents).toBe(50000);
      expect(res.body.data.total_spent_cents).toBe(17000);
      expect(res.body.data.remaining_cents).toBe(33000);
      expect(res.body.data.total_income_cents).toBe(100000);
      expect(res.body.data.by_category).toHaveLength(2);
    });

    it('returns 400 when month parameter is missing', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Cookie', cookies);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION');
    });

    it('returns 400 for invalid month format', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary?month=March-2026')
        .set('Cookie', cookies);

      expect(res.status).toBe(400);
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/v1/dashboard/summary?month=2026-03');
      expect(res.status).toBe(401);
    });

    it('handles empty month with no budgets or transactions', async () => {
      prismaMock.budget.findMany.mockResolvedValue([]);
      prismaMock.transaction.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/dashboard/summary?month=2026-06')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.data.total_budget_cents).toBe(0);
      expect(res.body.data.total_spent_cents).toBe(0);
      expect(res.body.data.remaining_cents).toBe(0);
    });
  });

  describe('GET /api/v1/dashboard/analytics', () => {
    it('returns trend and category breakdown', async () => {
      prismaMock.transaction.findMany.mockResolvedValue([
        makeTransaction(1, 'expense', 5000, 1, 'Food', '2026-01-15'),
        makeTransaction(2, 'expense', 8000, 1, 'Food', '2026-02-10'),
        makeTransaction(3, 'expense', 3000, 2, 'Transport', '2026-02-20'),
      ]);

      const res = await request(app)
        .get('/api/v1/dashboard/analytics?from=2026-01&to=2026-03')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.data.trend).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ month: '2026-01', total_spent_cents: 5000 }),
          expect.objectContaining({ month: '2026-02', total_spent_cents: 11000 }),
        ]),
      );
      expect(res.body.data.by_category).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ category_name: 'Food', spent_cents: 13000 }),
          expect.objectContaining({ category_name: 'Transport', spent_cents: 3000 }),
        ]),
      );
    });

    it('returns 400 when from/to are missing', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/analytics')
        .set('Cookie', cookies);

      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid date format', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/analytics?from=2026-1&to=2026-3')
        .set('Cookie', cookies);

      expect(res.status).toBe(400);
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/v1/dashboard/analytics?from=2026-01&to=2026-03');
      expect(res.status).toBe(401);
    });
  });
});

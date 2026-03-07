import request from 'supertest';
import app from '../../src/app';
import { prismaMock } from '../mocks/database';
import { createAuthCookies, TEST_BUDGET } from '../helpers';

jest.mock('../../src/config/database', () => ({
  prisma: require('../mocks/database').prismaMock,
  disconnectDatabase: jest.fn(),
}));

describe('Budgets API', () => {
  const cookies = createAuthCookies(1);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/budgets', () => {
    it('returns budgets for the authenticated user', async () => {
      prismaMock.budget.findMany.mockResolvedValue([TEST_BUDGET]);

      const res = await request(app)
        .get('/api/v1/budgets')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toHaveProperty('amount_cents', 50000);
      expect(res.body.data[0]).toHaveProperty('category_name', 'Food');
    });

    it('supports month filter query param', async () => {
      prismaMock.budget.findMany.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/budgets?month=2026-03')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/v1/budgets');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/budgets', () => {
    it('creates a new budget and returns 201', async () => {
      prismaMock.budget.create.mockResolvedValue(TEST_BUDGET);

      const res = await request(app)
        .post('/api/v1/budgets')
        .set('Cookie', cookies)
        .send({
          category_id: 1,
          month: '2026-03',
          amount_cents: 50000,
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('amount_cents', 50000);
    });

    it('returns 409 on duplicate budget for same category and month', async () => {
      prismaMock.budget.create.mockRejectedValue({ code: 'P2002' });

      const res = await request(app)
        .post('/api/v1/budgets')
        .set('Cookie', cookies)
        .send({
          category_id: 1,
          month: '2026-03',
          amount_cents: 50000,
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('returns 400 for invalid month format', async () => {
      const res = await request(app)
        .post('/api/v1/budgets')
        .set('Cookie', cookies)
        .send({
          category_id: 1,
          month: 'March 2026',
          amount_cents: 50000,
        });

      expect(res.status).toBe(400);
    });

    it('returns 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/budgets')
        .set('Cookie', cookies)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/v1/budgets/:id', () => {
    it('updates budget amount', async () => {
      prismaMock.budget.findFirst.mockResolvedValue(TEST_BUDGET);
      prismaMock.budget.findFirstOrThrow.mockResolvedValue(TEST_BUDGET);
      prismaMock.budget.update.mockResolvedValue({
        ...TEST_BUDGET,
        amountCents: 60000,
      });

      const res = await request(app)
        .patch('/api/v1/budgets/1')
        .set('Cookie', cookies)
        .send({ amount_cents: 60000 });

      expect(res.status).toBe(200);
    });

    it('returns 404 for non-existent budget', async () => {
      prismaMock.budget.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/v1/budgets/999')
        .set('Cookie', cookies)
        .send({ amount_cents: 60000 });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/budgets/:id', () => {
    it('deletes a budget and returns 204', async () => {
      prismaMock.budget.findFirst.mockResolvedValue(TEST_BUDGET);
      prismaMock.budget.findFirstOrThrow.mockResolvedValue(TEST_BUDGET);
      prismaMock.budget.delete.mockResolvedValue(TEST_BUDGET);

      const res = await request(app)
        .delete('/api/v1/budgets/1')
        .set('Cookie', cookies);

      expect(res.status).toBe(204);
    });

    it('returns 404 for non-existent budget', async () => {
      prismaMock.budget.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/v1/budgets/999')
        .set('Cookie', cookies);

      expect(res.status).toBe(404);
    });
  });
});

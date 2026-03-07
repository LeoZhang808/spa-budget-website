import request from 'supertest';
import app from '../../src/app';
import { prismaMock } from '../mocks/database';
import { createAuthCookies, TEST_TRANSACTION } from '../helpers';

jest.mock('../../src/config/database', () => ({
  prisma: require('../mocks/database').prismaMock,
  disconnectDatabase: jest.fn(),
}));

describe('Transactions API', () => {
  const cookies = createAuthCookies(1);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/transactions', () => {
    it('returns paginated transactions for authenticated user', async () => {
      prismaMock.transaction.findMany.mockResolvedValue([TEST_TRANSACTION]);
      prismaMock.transaction.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/transactions')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toHaveProperty('amount_cents', 1500);
      expect(res.body.data[0]).toHaveProperty('type', 'expense');
      expect(res.body.meta).toEqual({ page: 1, limit: 20, total: 1 });
    });

    it('supports type filter', async () => {
      prismaMock.transaction.findMany.mockResolvedValue([]);
      prismaMock.transaction.count.mockResolvedValue(0);

      const res = await request(app)
        .get('/api/v1/transactions?type=income')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('supports pagination params', async () => {
      prismaMock.transaction.findMany.mockResolvedValue([]);
      prismaMock.transaction.count.mockResolvedValue(0);

      const res = await request(app)
        .get('/api/v1/transactions?page=2&limit=5')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.meta).toEqual({ page: 2, limit: 5, total: 0 });
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/v1/transactions');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/transactions', () => {
    it('creates a new transaction and returns 201', async () => {
      prismaMock.transaction.create.mockResolvedValue(TEST_TRANSACTION);

      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Cookie', cookies)
        .send({
          type: 'expense',
          amount_cents: 1500,
          category_id: 1,
          transaction_date: '2026-03-01',
          note: 'Lunch',
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.amount_cents).toBe(1500);
    });

    it('returns 400 for invalid amount_cents (zero)', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Cookie', cookies)
        .send({
          type: 'expense',
          amount_cents: 0,
          category_id: 1,
          transaction_date: '2026-03-01',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION');
    });

    it('returns 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Cookie', cookies)
        .send({ type: 'expense' });

      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid type', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Cookie', cookies)
        .send({
          type: 'refund',
          amount_cents: 100,
          category_id: 1,
          transaction_date: '2026-03-01',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/transactions/:id', () => {
    it('returns a single transaction', async () => {
      prismaMock.transaction.findFirst.mockResolvedValue(TEST_TRANSACTION);

      const res = await request(app)
        .get('/api/v1/transactions/1')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('id', 1);
    });

    it('returns 404 for non-existent transaction', async () => {
      prismaMock.transaction.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/transactions/999')
        .set('Cookie', cookies);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/transactions/:id', () => {
    it('updates a transaction', async () => {
      prismaMock.transaction.findFirst.mockResolvedValue(TEST_TRANSACTION);
      prismaMock.transaction.findFirstOrThrow.mockResolvedValue(TEST_TRANSACTION);
      prismaMock.transaction.update.mockResolvedValue({
        ...TEST_TRANSACTION,
        amountCents: 2000,
      });

      const res = await request(app)
        .patch('/api/v1/transactions/1')
        .set('Cookie', cookies)
        .send({ amount_cents: 2000 });

      expect(res.status).toBe(200);
    });

    it('returns 404 when transaction does not exist', async () => {
      prismaMock.transaction.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/v1/transactions/999')
        .set('Cookie', cookies)
        .send({ amount_cents: 2000 });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/transactions/:id', () => {
    it('deletes a transaction and returns 204', async () => {
      prismaMock.transaction.findFirst.mockResolvedValue(TEST_TRANSACTION);
      prismaMock.transaction.findFirstOrThrow.mockResolvedValue(TEST_TRANSACTION);
      prismaMock.transaction.delete.mockResolvedValue(TEST_TRANSACTION);

      const res = await request(app)
        .delete('/api/v1/transactions/1')
        .set('Cookie', cookies);

      expect(res.status).toBe(204);
    });

    it('returns 404 when transaction does not exist', async () => {
      prismaMock.transaction.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/v1/transactions/999')
        .set('Cookie', cookies);

      expect(res.status).toBe(404);
    });
  });
});

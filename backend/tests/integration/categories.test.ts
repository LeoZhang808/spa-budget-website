import request from 'supertest';
import app from '../../src/app';
import { prismaMock } from '../mocks/database';
import { createAuthCookies, TEST_CATEGORY } from '../helpers';

jest.mock('../../src/config/database', () => ({
  prisma: require('../mocks/database').prismaMock,
  disconnectDatabase: jest.fn(),
}));

describe('Categories API', () => {
  const cookies = createAuthCookies(1);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/categories', () => {
    it('returns list of categories for authenticated user', async () => {
      prismaMock.category.findMany.mockResolvedValue([TEST_CATEGORY]);

      const res = await request(app)
        .get('/api/v1/categories')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toHaveProperty('name', 'Food');
      expect(res.body.data[0]).toHaveProperty('is_system', false);
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/v1/categories');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/categories', () => {
    it('creates a new category and returns 201', async () => {
      prismaMock.category.create.mockResolvedValue({
        ...TEST_CATEGORY,
        id: 2,
        name: 'Transport',
      });

      const res = await request(app)
        .post('/api/v1/categories')
        .set('Cookie', cookies)
        .send({ name: 'Transport' });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('name', 'Transport');
    });

    it('returns 409 on duplicate category name', async () => {
      prismaMock.category.create.mockRejectedValue({ code: 'P2002' });

      const res = await request(app)
        .post('/api/v1/categories')
        .set('Cookie', cookies)
        .send({ name: 'Food' });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('returns 400 for missing name', async () => {
      const res = await request(app)
        .post('/api/v1/categories')
        .set('Cookie', cookies)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('PATCH /api/v1/categories/:id', () => {
    it('updates a category name', async () => {
      prismaMock.category.findFirst.mockResolvedValue(TEST_CATEGORY);
      prismaMock.category.findFirstOrThrow.mockResolvedValue(TEST_CATEGORY);
      prismaMock.category.update.mockResolvedValue({
        ...TEST_CATEGORY,
        name: 'Groceries',
      });

      const res = await request(app)
        .patch('/api/v1/categories/1')
        .set('Cookie', cookies)
        .send({ name: 'Groceries' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('name', 'Groceries');
    });

    it('returns 404 for non-existent category', async () => {
      prismaMock.category.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/v1/categories/999')
        .set('Cookie', cookies)
        .send({ name: 'New Name' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/categories/:id', () => {
    it('deletes a category with no transactions', async () => {
      prismaMock.category.findFirst.mockResolvedValue(TEST_CATEGORY);
      prismaMock.transaction.count.mockResolvedValue(0);
      prismaMock.category.findFirstOrThrow.mockResolvedValue(TEST_CATEGORY);
      prismaMock.category.delete.mockResolvedValue(TEST_CATEGORY);

      const res = await request(app)
        .delete('/api/v1/categories/1')
        .set('Cookie', cookies);

      expect(res.status).toBe(204);
    });

    it('returns 409 when category has transactions', async () => {
      prismaMock.category.findFirst.mockResolvedValue(TEST_CATEGORY);
      prismaMock.transaction.count.mockResolvedValue(5);

      const res = await request(app)
        .delete('/api/v1/categories/1')
        .set('Cookie', cookies);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('returns 404 for non-existent category', async () => {
      prismaMock.category.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/v1/categories/999')
        .set('Cookie', cookies);

      expect(res.status).toBe(404);
    });
  });
});

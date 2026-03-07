import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../src/app';
import { prismaMock } from '../mocks/database';
import { createAuthCookies, TEST_USER } from '../helpers';

jest.mock('../../src/config/database', () => ({
  prisma: require('../mocks/database').prismaMock,
  disconnectDatabase: jest.fn(),
}));

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('returns 201 and user data on successful registration', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue(TEST_USER);
      prismaMock.category.create.mockResolvedValue({ id: 1 });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'new@example.com', password: 'Password123', display_name: 'New User' });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('email');
      expect(res.body.data).not.toHaveProperty('passwordHash');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('returns 409 when email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue(TEST_USER);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', password: 'Password123' });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('returns 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'not-an-email', password: 'Password123' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION');
    });

    it('returns 400 for password shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'new@example.com', password: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns 200 and sets cookies on successful login', async () => {
      const hash = await bcrypt.hash('Password123', 10);
      prismaMock.user.findUnique.mockResolvedValue({ ...TEST_USER, passwordHash: hash });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'Password123' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('email', 'test@example.com');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('returns 401 for wrong password', async () => {
      const hash = await bcrypt.hash('Password123', 10);
      prismaMock.user.findUnique.mockResolvedValue({ ...TEST_USER, passwordHash: hash });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns 401 for non-existent email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@example.com', password: 'Password123' });

      expect(res.status).toBe(401);
    });

    it('returns 400 for missing fields', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('returns 200 and clears cookies when authenticated', async () => {
      const cookies = createAuthCookies(1);
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).post('/api/v1/auth/logout');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns current user when authenticated', async () => {
      prismaMock.user.findUnique.mockResolvedValue(TEST_USER);
      const cookies = createAuthCookies(1);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('email', 'test@example.com');
      expect(res.body.data).toHaveProperty('display_name', 'Test User');
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/auth/me', () => {
    it('updates display_name', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.update.mockResolvedValue({ ...TEST_USER, displayName: 'Updated' });

      const cookies = createAuthCookies(1);
      const res = await request(app)
        .patch('/api/v1/auth/me')
        .set('Cookie', cookies)
        .send({ display_name: 'Updated' });

      expect(res.status).toBe(200);
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app)
        .patch('/api/v1/auth/me')
        .send({ display_name: 'Updated' });

      expect(res.status).toBe(401);
    });
  });
});

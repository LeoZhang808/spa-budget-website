import request from 'supertest';
import app from '../../src/app';
import { prismaMock } from '../mocks/database';
import { createAuthCookies } from '../helpers';

jest.mock('../../src/config/database', () => ({
  prisma: require('../mocks/database').prismaMock,
  disconnectDatabase: jest.fn(),
}));

/**
 * Performance tests that verify API response times stay under 2 seconds
 * with realistic data volumes (~1,000 transactions, 20 budgets).
 *
 * These tests use mocked Prisma data to simulate the volume without
 * requiring a live database. In a real environment, run against Docker
 * Compose with seeded data for accurate measurements.
 */

function generateTransactions(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    userId: 1,
    type: i % 3 === 0 ? ('income' as const) : ('expense' as const),
    amountCents: Math.floor(Math.random() * 50000) + 100,
    categoryId: (i % 8) + 1,
    category: { id: (i % 8) + 1, name: `Category ${(i % 8) + 1}` },
    transactionDate: new Date(`2026-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`),
    note: `Transaction note #${i + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

function generateBudgets(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    userId: 1,
    categoryId: (i % 8) + 1,
    category: { id: (i % 8) + 1, name: `Category ${(i % 8) + 1}` },
    month: new Date('2026-03-01'),
    amountCents: 50000 + i * 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

const SLA_MS = 2000;

describe('Performance: API response times under 2s with ~1000 transactions', () => {
  const cookies = createAuthCookies(1);
  const transactions = generateTransactions(1000);
  const budgets = generateBudgets(20);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`GET /transactions responds under ${SLA_MS}ms with 1000 records`, async () => {
    const pageSize = 20;
    prismaMock.transaction.findMany.mockResolvedValue(transactions.slice(0, pageSize));
    prismaMock.transaction.count.mockResolvedValue(1000);

    const start = Date.now();
    const res = await request(app)
      .get('/api/v1/transactions')
      .set('Cookie', cookies);
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(pageSize);
    expect(res.body.meta.total).toBe(1000);
    expect(elapsed).toBeLessThan(SLA_MS);
    console.log(`  GET /transactions: ${elapsed}ms`);
  });

  it(`GET /transactions with filters responds under ${SLA_MS}ms`, async () => {
    const filtered = transactions.filter((t) => t.type === 'expense').slice(0, 20);
    prismaMock.transaction.findMany.mockResolvedValue(filtered);
    prismaMock.transaction.count.mockResolvedValue(filtered.length);

    const start = Date.now();
    const res = await request(app)
      .get('/api/v1/transactions?type=expense&from=2026-01-01&to=2026-12-31&page=1&limit=20')
      .set('Cookie', cookies);
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(SLA_MS);
    console.log(`  GET /transactions (filtered): ${elapsed}ms`);
  });

  it(`GET /dashboard/summary responds under ${SLA_MS}ms with 20 budgets and 1000 transactions`, async () => {
    const monthTransactions = transactions.filter(
      (t) => t.transactionDate.getMonth() === 2, // March
    );
    prismaMock.budget.findMany.mockResolvedValue(budgets);
    prismaMock.transaction.findMany.mockResolvedValue(monthTransactions);

    const start = Date.now();
    const res = await request(app)
      .get('/api/v1/dashboard/summary?month=2026-03')
      .set('Cookie', cookies);
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('total_budget_cents');
    expect(res.body.data).toHaveProperty('total_spent_cents');
    expect(res.body.data).toHaveProperty('by_category');
    expect(elapsed).toBeLessThan(SLA_MS);
    console.log(`  GET /dashboard/summary: ${elapsed}ms`);
  });

  it(`GET /dashboard/analytics responds under ${SLA_MS}ms with 1000 transactions`, async () => {
    const expenseTransactions = transactions.filter((t) => t.type === 'expense');
    prismaMock.transaction.findMany.mockResolvedValue(expenseTransactions);

    const start = Date.now();
    const res = await request(app)
      .get('/api/v1/dashboard/analytics?from=2026-01&to=2026-12')
      .set('Cookie', cookies);
    const elapsed = Date.now() - start;

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('trend');
    expect(res.body.data).toHaveProperty('by_category');
    expect(elapsed).toBeLessThan(SLA_MS);
    console.log(`  GET /dashboard/analytics: ${elapsed}ms`);
  });

  it(`POST /transactions responds under ${SLA_MS}ms`, async () => {
    prismaMock.transaction.create.mockResolvedValue(transactions[0]);

    const start = Date.now();
    const res = await request(app)
      .post('/api/v1/transactions')
      .set('Cookie', cookies)
      .send({
        type: 'expense',
        amount_cents: 2500,
        category_id: 1,
        transaction_date: '2026-03-15',
        note: 'Performance test',
      });
    const elapsed = Date.now() - start;

    expect(res.status).toBe(201);
    expect(elapsed).toBeLessThan(SLA_MS);
    console.log(`  POST /transactions: ${elapsed}ms`);
  });
});

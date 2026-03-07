import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export interface TransactionFilters {
  from?: string;
  to?: string;
  category_id?: number;
  type?: 'expense' | 'income';
  search?: string;
  page: number;
  limit: number;
  sort: string;
}

function buildWhere(userId: number, filters: TransactionFilters): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { userId };

  if (filters.from) {
    where.transactionDate = { ...where.transactionDate as object, gte: new Date(filters.from) };
  }
  if (filters.to) {
    where.transactionDate = { ...where.transactionDate as object, lte: new Date(filters.to) };
  }
  if (filters.category_id) {
    where.categoryId = filters.category_id;
  }
  if (filters.type) {
    where.type = filters.type;
  }
  if (filters.search) {
    where.note = { contains: filters.search };
  }

  return where;
}

function buildOrderBy(sort: string): Prisma.TransactionOrderByWithRelationInput {
  switch (sort) {
    case 'date_asc':
      return { transactionDate: 'asc' };
    case 'amount_asc':
      return { amountCents: 'asc' };
    case 'amount_desc':
      return { amountCents: 'desc' };
    case 'date_desc':
    default:
      return { transactionDate: 'desc' };
  }
}

export const transactionRepository = {
  async findAllByUser(userId: number, filters: TransactionFilters) {
    const where = buildWhere(userId, filters);
    const orderBy = buildOrderBy(filters.sort);
    const skip = (filters.page - 1) * filters.limit;

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy,
        skip,
        take: filters.limit,
        include: { category: { select: { id: true, name: true } } },
      }),
      prisma.transaction.count({ where }),
    ]);

    return { data, total };
  },

  async findById(userId: number, id: number) {
    return prisma.transaction.findFirst({
      where: { id, userId },
      include: { category: { select: { id: true, name: true } } },
    });
  },

  async create(
    userId: number,
    data: {
      type: 'expense' | 'income';
      amountCents: number;
      categoryId: number;
      transactionDate: Date;
      note?: string;
    },
  ) {
    return prisma.transaction.create({
      data: { ...data, userId },
      include: { category: { select: { id: true, name: true } } },
    });
  },

  async update(
    userId: number,
    id: number,
    data: {
      type?: 'expense' | 'income';
      amountCents?: number;
      categoryId?: number;
      transactionDate?: Date;
      note?: string;
    },
  ) {
    await prisma.transaction.findFirstOrThrow({ where: { id, userId } });
    return prisma.transaction.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true } } },
    });
  },

  async delete(userId: number, id: number) {
    await prisma.transaction.findFirstOrThrow({ where: { id, userId } });
    await prisma.transaction.delete({ where: { id } });
  },
};

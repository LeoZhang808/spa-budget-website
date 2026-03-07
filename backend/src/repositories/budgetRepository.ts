import { prisma } from '../config/database';

export const budgetRepository = {
  async findAllByUser(userId: number, month?: string) {
    const where: { userId: number; month?: Date } = { userId };
    if (month) {
      where.month = new Date(`${month}-01`);
    }
    return prisma.budget.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      orderBy: { month: 'desc' },
    });
  },

  async findById(userId: number, id: number) {
    return prisma.budget.findFirst({
      where: { id, userId },
      include: { category: { select: { id: true, name: true } } },
    });
  },

  async create(userId: number, data: { categoryId: number; month: Date; amountCents: number }) {
    return prisma.budget.create({
      data: { ...data, userId },
      include: { category: { select: { id: true, name: true } } },
    });
  },

  async update(userId: number, id: number, data: { amountCents?: number }) {
    await prisma.budget.findFirstOrThrow({ where: { id, userId } });
    return prisma.budget.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true } } },
    });
  },

  async delete(userId: number, id: number) {
    await prisma.budget.findFirstOrThrow({ where: { id, userId } });
    await prisma.budget.delete({ where: { id } });
  },
};

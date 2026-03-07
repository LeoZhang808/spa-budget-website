import { prisma } from '../config/database';

export const categoryRepository = {
  async findAllByUser(userId: number) {
    return prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  },

  async findById(userId: number, id: number) {
    return prisma.category.findFirst({ where: { id, userId } });
  },

  async create(userId: number, data: { name: string; isSystem?: boolean }) {
    return prisma.category.create({
      data: { ...data, userId },
    });
  },

  async update(userId: number, id: number, data: { name?: string }) {
    await prisma.category.findFirstOrThrow({ where: { id, userId } });
    return prisma.category.update({ where: { id }, data });
  },

  async delete(userId: number, id: number) {
    await prisma.category.findFirstOrThrow({ where: { id, userId } });
    await prisma.category.delete({ where: { id } });
  },

  async countTransactions(userId: number, categoryId: number) {
    return prisma.transaction.count({ where: { userId, categoryId } });
  },
};

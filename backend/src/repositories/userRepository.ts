import { prisma } from '../config/database';

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async create(data: { email: string; passwordHash: string; displayName?: string }) {
    return prisma.user.create({ data });
  },

  async updateProfile(id: number, data: { email?: string; displayName?: string }) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
};

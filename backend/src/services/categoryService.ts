import { categoryRepository } from '../repositories/categoryRepository';
import { AppError } from '../middleware/errorHandler';

const DEFAULT_CATEGORIES = [
  'Food',
  'Transportation',
  'Housing',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Shopping',
  'Other',
];

export const categoryService = {
  async listCategories(userId: number) {
    return categoryRepository.findAllByUser(userId);
  },

  async createCategory(userId: number, name: string) {
    try {
      return await categoryRepository.create(userId, { name });
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        throw new AppError(409, 'CONFLICT', 'Category with this name already exists');
      }
      throw err;
    }
  },

  async updateCategory(userId: number, id: number, name: string) {
    const existing = await categoryRepository.findById(userId, id);
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Category not found');
    }

    try {
      return await categoryRepository.update(userId, id, { name });
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        throw new AppError(409, 'CONFLICT', 'Category with this name already exists');
      }
      throw err;
    }
  },

  async deleteCategory(userId: number, id: number) {
    const existing = await categoryRepository.findById(userId, id);
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Category not found');
    }

    const txCount = await categoryRepository.countTransactions(userId, id);
    if (txCount > 0) {
      throw new AppError(
        409,
        'CONFLICT',
        'Cannot delete category with existing transactions',
      );
    }

    await categoryRepository.delete(userId, id);
  },

  async seedDefaultCategories(userId: number) {
    await Promise.all(
      DEFAULT_CATEGORIES.map((name) =>
        categoryRepository.create(userId, { name, isSystem: true }),
      ),
    );
  },
};

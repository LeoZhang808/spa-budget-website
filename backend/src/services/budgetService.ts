import { budgetRepository } from '../repositories/budgetRepository';
import { AppError } from '../middleware/errorHandler';

function normalizeMonth(month: string): Date {
  return new Date(`${month}-01`);
}

export const budgetService = {
  async listBudgets(userId: number, month?: string) {
    return budgetRepository.findAllByUser(userId, month);
  },

  async createBudget(
    userId: number,
    data: { category_id: number; month: string; amount_cents: number },
  ) {
    try {
      return await budgetRepository.create(userId, {
        categoryId: data.category_id,
        month: normalizeMonth(data.month),
        amountCents: data.amount_cents,
      });
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        throw new AppError(
          409,
          'CONFLICT',
          'Budget already exists for this category and month',
        );
      }
      throw err;
    }
  },

  async updateBudget(
    userId: number,
    id: number,
    data: { amount_cents?: number },
  ) {
    const existing = await budgetRepository.findById(userId, id);
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Budget not found');
    }

    return budgetRepository.update(userId, id, {
      amountCents: data.amount_cents,
    });
  },

  async deleteBudget(userId: number, id: number) {
    const existing = await budgetRepository.findById(userId, id);
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Budget not found');
    }
    await budgetRepository.delete(userId, id);
  },
};

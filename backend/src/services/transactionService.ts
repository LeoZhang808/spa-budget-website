import { transactionRepository, TransactionFilters } from '../repositories/transactionRepository';
import { AppError } from '../middleware/errorHandler';

export const transactionService = {
  async listTransactions(userId: number, filters: TransactionFilters) {
    const { data, total } = await transactionRepository.findAllByUser(userId, filters);
    return {
      data,
      meta: { page: filters.page, limit: filters.limit, total },
    };
  },

  async getTransaction(userId: number, id: number) {
    const transaction = await transactionRepository.findById(userId, id);
    if (!transaction) {
      throw new AppError(404, 'NOT_FOUND', 'Transaction not found');
    }
    return transaction;
  },

  async createTransaction(
    userId: number,
    data: {
      type: 'expense' | 'income';
      amount_cents: number;
      category_id: number;
      transaction_date: Date;
      note?: string;
    },
  ) {
    return transactionRepository.create(userId, {
      type: data.type,
      amountCents: data.amount_cents,
      categoryId: data.category_id,
      transactionDate: data.transaction_date,
      note: data.note,
    });
  },

  async updateTransaction(
    userId: number,
    id: number,
    data: {
      type?: 'expense' | 'income';
      amount_cents?: number;
      category_id?: number;
      transaction_date?: Date;
      note?: string;
    },
  ) {
    const existing = await transactionRepository.findById(userId, id);
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Transaction not found');
    }

    return transactionRepository.update(userId, id, {
      type: data.type,
      amountCents: data.amount_cents,
      categoryId: data.category_id,
      transactionDate: data.transaction_date,
      note: data.note,
    });
  },

  async deleteTransaction(userId: number, id: number) {
    const existing = await transactionRepository.findById(userId, id);
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Transaction not found');
    }
    await transactionRepository.delete(userId, id);
  },
};

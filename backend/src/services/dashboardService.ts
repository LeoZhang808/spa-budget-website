import { prisma } from '../config/database';

export const dashboardService = {
  async getSummary(userId: number, month: string) {
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const [budgets, transactions] = await Promise.all([
      prisma.budget.findMany({
        where: { userId, month: startDate },
        include: { category: { select: { id: true, name: true } } },
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          transactionDate: { gte: startDate, lt: endDate },
        },
        include: { category: { select: { id: true, name: true } } },
      }),
    ]);

    const totalBudgetCents = budgets.reduce((sum, b) => sum + b.amountCents, 0);

    let totalSpentCents = 0;
    let totalIncomeCents = 0;
    const spentByCategory = new Map<number, { category_id: number; category_name: string; spent_cents: number; budget_cents: number }>();

    for (const budget of budgets) {
      spentByCategory.set(budget.categoryId, {
        category_id: budget.category.id,
        category_name: budget.category.name,
        spent_cents: 0,
        budget_cents: budget.amountCents,
      });
    }

    for (const tx of transactions) {
      if (tx.type === 'expense') {
        totalSpentCents += tx.amountCents;
        const cat = spentByCategory.get(tx.categoryId);
        if (cat) {
          cat.spent_cents += tx.amountCents;
        } else {
          spentByCategory.set(tx.categoryId, {
            category_id: tx.category.id,
            category_name: tx.category.name,
            spent_cents: tx.amountCents,
            budget_cents: 0,
          });
        }
      } else {
        totalIncomeCents += tx.amountCents;
      }
    }

    return {
      month,
      total_budget_cents: totalBudgetCents,
      total_spent_cents: totalSpentCents,
      remaining_cents: totalBudgetCents - totalSpentCents,
      total_income_cents: totalIncomeCents,
      by_category: Array.from(spentByCategory.values()),
    };
  },

  async getAnalytics(userId: number, from: string, to: string) {
    const startDate = new Date(`${from}-01`);
    const toDate = new Date(`${to}-01`);
    toDate.setMonth(toDate.getMonth() + 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'expense',
        transactionDate: { gte: startDate, lt: toDate },
      },
      include: { category: { select: { id: true, name: true } } },
    });

    const trendMap = new Map<string, number>();
    const categoryMap = new Map<number, { category_id: number; category_name: string; spent_cents: number }>();

    for (const tx of transactions) {
      const monthKey = `${tx.transactionDate.getFullYear()}-${String(tx.transactionDate.getMonth() + 1).padStart(2, '0')}`;
      trendMap.set(monthKey, (trendMap.get(monthKey) ?? 0) + tx.amountCents);

      const cat = categoryMap.get(tx.categoryId);
      if (cat) {
        cat.spent_cents += tx.amountCents;
      } else {
        categoryMap.set(tx.categoryId, {
          category_id: tx.category.id,
          category_name: tx.category.name,
          spent_cents: tx.amountCents,
        });
      }
    }

    const trend = Array.from(trendMap.entries())
      .map(([month, total_spent_cents]) => ({ month, total_spent_cents }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      trend,
      by_category: Array.from(categoryMap.values()),
    };
  },
};

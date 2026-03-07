export function toUserResponse(user: any) {
  return {
    id: user.id,
    email: user.email,
    display_name: user.displayName ?? user.display_name ?? null,
    created_at: user.createdAt ?? user.created_at,
    updated_at: user.updatedAt ?? user.updated_at,
  };
}

export function toCategoryResponse(cat: any) {
  return {
    id: cat.id,
    name: cat.name,
    is_system: cat.isSystem ?? cat.is_system ?? false,
    created_at: cat.createdAt ?? cat.created_at,
    updated_at: cat.updatedAt ?? cat.updated_at,
  };
}

export function toTransactionResponse(tx: any) {
  const txDate = tx.transactionDate ?? tx.transaction_date;
  return {
    id: tx.id,
    type: tx.type,
    amount_cents: tx.amountCents ?? tx.amount_cents,
    category_id: tx.categoryId ?? tx.category_id,
    category_name: tx.category?.name ?? tx.category_name ?? null,
    transaction_date:
      txDate instanceof Date ? txDate.toISOString().split('T')[0] : txDate,
    note: tx.note ?? null,
    created_at: tx.createdAt ?? tx.created_at,
    updated_at: tx.updatedAt ?? tx.updated_at,
  };
}

export function toBudgetResponse(budget: any) {
  const month = budget.month;
  return {
    id: budget.id,
    category_id: budget.categoryId ?? budget.category_id,
    category_name: budget.category?.name ?? budget.category_name ?? null,
    month:
      month instanceof Date
        ? `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`
        : month,
    amount_cents: budget.amountCents ?? budget.amount_cents,
    created_at: budget.createdAt ?? budget.created_at,
    updated_at: budget.updatedAt ?? budget.updated_at,
  };
}

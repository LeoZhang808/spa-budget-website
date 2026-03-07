import { useState, useEffect, useCallback } from 'react';
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../../api/transactionClient';
import type { Transaction, TransactionFilters as TxFilters, TransactionInput } from '../../api/transactionClient';
import {
  TransactionFilters,
  type FilterState,
} from '../../components/Transactions/TransactionFilters';
import {
  TransactionForm,
  type TransactionFormData,
} from '../../components/Transactions/TransactionForm';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCents } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import './Transactions.css';

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('-date');
  const [filters, setFilters] = useState<FilterState>({
    from: '',
    to: '',
    category_id: '',
    type: '',
    search: '',
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: TxFilters = { page, limit, sort };
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.type) params.type = filters.type as 'expense' | 'income';
      if (filters.search) params.search = filters.search;

      const res = await listTransactions(params);
      setTransactions(res.data ?? []);
      setTotal(res.meta?.total ?? 0);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  }, [page, sort, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const toInput = (data: TransactionFormData): TransactionInput => ({
    type: data.type,
    amount_cents: data.amount_cents,
    category_id: data.category_id,
    transaction_date: data.date,
    note: data.note || undefined,
  });

  const handleCreate = async (data: TransactionFormData) => {
    await createTransaction(toInput(data));
    setModalOpen(false);
    fetchData();
  };

  const handleUpdate = async (data: TransactionFormData) => {
    if (!editing) return;
    await updateTransaction(editing.id, toInput(data));
    setEditing(null);
    setModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this transaction?')) return;
    await deleteTransaction(id);
    fetchData();
  };

  const openEdit = (tx: Transaction) => {
    setEditing(tx);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const toggleSort = (field: string) => {
    setSort((prev) => (prev === field ? `-${field}` : field));
  };

  const sortIndicator = (field: string) => {
    if (sort === field) return ' ↑';
    if (sort === `-${field}`) return ' ↓';
    return '';
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>Transactions</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Transaction
        </button>
      </div>

      <TransactionFilters value={filters} onChange={setFilters} />

      {loading ? (
        <LoadingSpinner />
      ) : transactions.length === 0 ? (
        <EmptyState
          message="No transactions found"
          actionLabel="Add Transaction"
          onAction={openCreate}
        />
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th
                    className="sortable"
                    onClick={() => toggleSort('date')}
                  >
                    Date{sortIndicator('date')}
                  </th>
                  <th>Type</th>
                  <th>Category</th>
                  <th
                    className="sortable"
                    onClick={() => toggleSort('amount_cents')}
                  >
                    Amount{sortIndicator('amount_cents')}
                  </th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{formatDate(tx.transaction_date)}</td>
                    <td>
                      <span
                        className={`type-badge type-badge--${tx.type}`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td>{tx.category_name ?? '—'}</td>
                    <td
                      className={
                        tx.type === 'income' ? 'text-success' : 'text-danger'
                      }
                    >
                      {tx.type === 'income' ? '+' : '−'}
                      {formatCents(tx.amount_cents)}
                    </td>
                    <td className="note-cell">{tx.note || '—'}</td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => openEdit(tx)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger-outline"
                          onClick={() => handleDelete(tx.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              className="btn btn-sm btn-outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span className="pagination-info">
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-sm btn-outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit Transaction' : 'New Transaction'}
      >
        <TransactionForm
          initial={
            editing
              ? {
                  type: editing.type,
                  amount_cents: editing.amount_cents,
                  category_id: String(editing.category_id),
                  date: editing.transaction_date,
                  note: editing.note ?? '',
                }
              : undefined
          }
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      </Modal>
    </div>
  );
}

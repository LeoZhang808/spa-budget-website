import { useState, useEffect, useCallback, type FormEvent } from 'react';
import {
  listBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../../api/budgetClient';
import type { Budget } from '../../api/budgetClient';
import { listCategories } from '../../api/categoryClient';
import type { Category } from '../../api/categoryClient';
import { formatCents } from '../../utils/formatCurrency';
import { formatMonth, getCurrentMonth } from '../../utils/formatDate';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import './Budgets.css';

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function BudgetsPage() {
  const [month, setMonth] = useState(getCurrentMonth);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formCat, setFormCat] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [b, c] = await Promise.all([
        listBudgets(month),
        listCategories(),
      ]);
      setBudgets(b);
      setCategories(c);
    } catch (err) {
      console.error('Failed to fetch budgets', err);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditingBudget(null);
    setFormCat('');
    setFormAmount('');
    setError('');
    setModalOpen(true);
  };

  const openEdit = (b: Budget) => {
    setEditingBudget(b);
    setFormCat(String(b.category_id));
    setFormAmount((b.amount_cents / 100).toFixed(2));
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const cents = Math.round(parseFloat(formAmount) * 100);
    if (!formAmount || isNaN(cents) || cents <= 0) {
      setError('Enter a valid positive amount');
      return;
    }
    if (!formCat) {
      setError('Select a category');
      return;
    }

    setFormLoading(true);
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, {
          category_id: formCat,
          amount_cents: cents,
          month,
        });
      } else {
        await createBudget({
          category_id: formCat,
          amount_cents: cents,
          month,
        });
      }
      setModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || 'Failed to save budget';
      setError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this budget?')) return;
    await deleteBudget(id);
    fetchData();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="budgets-page">
      <div className="page-header">
        <h1>Budgets</h1>
        <div className="page-header-actions">
          <div className="month-selector">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setMonth((m) => shiftMonth(m, -1))}
            >
              ‹
            </button>
            <span className="month-label">{formatMonth(month)}</span>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setMonth((m) => shiftMonth(m, 1))}
            >
              ›
            </button>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            + Add Budget
          </button>
        </div>
      </div>

      {budgets.length === 0 ? (
        <EmptyState
          message={`No budgets for ${formatMonth(month)}`}
          actionLabel="Add Budget"
          onAction={openCreate}
        />
      ) : (
        <div className="budgets-list">
          {budgets.map((b) => {
            const spent = 0;
            const pct =
              b.amount_cents > 0
                ? Math.min(100, (spent / b.amount_cents) * 100)
                : 0;
            const over = spent > b.amount_cents;
            return (
              <div className="budget-item" key={b.id}>
                <div className="budget-info">
                  <div className="budget-category">
                    {b.category_name ?? 'Unknown'}
                  </div>
                  <div className="budget-amounts">
                    <span className={over ? 'text-danger' : ''}>
                      {formatCents(spent)}
                    </span>
                    <span className="budget-sep">/</span>
                    <span>{formatCents(b.amount_cents)}</span>
                  </div>
                  <div className="progress-bar" style={{ marginTop: 6 }}>
                    <div
                      className={`progress-fill ${over ? 'progress-fill--over' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="action-btns">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => openEdit(b)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger-outline"
                    onClick={() => handleDelete(b.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBudget ? 'Edit Budget' : 'New Budget'}
      >
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <div className="form-group">
            <label htmlFor="budgetCat">Category</label>
            <select
              id="budgetCat"
              value={formCat}
              onChange={(e) => setFormCat(e.target.value)}
              required
            >
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="budgetAmt">Amount ($)</label>
            <input
              id="budgetAmt"
              type="number"
              step="0.01"
              min="0.01"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={formLoading}
            >
              {formLoading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

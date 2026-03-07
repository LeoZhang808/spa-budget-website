import { useState, useEffect, type FormEvent } from 'react';
import type { Category } from '../../api/categoryClient';
import { listCategories } from '../../api/categoryClient';

export interface TransactionFormData {
  type: 'expense' | 'income';
  amount_cents: number;
  category_id: string;
  date: string;
  note: string;
}

interface TransactionFormProps {
  initial?: Partial<TransactionFormData>;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
}

export function TransactionForm({
  initial,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const [type, setType] = useState<'expense' | 'income'>(
    initial?.type ?? 'expense',
  );
  const [amount, setAmount] = useState(
    initial?.amount_cents ? (initial.amount_cents / 100).toFixed(2) : '',
  );
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? '');
  const [date, setDate] = useState(
    initial?.date ?? new Date().toISOString().slice(0, 10),
  );
  const [note, setNote] = useState(initial?.note ?? '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listCategories().then(setCategories).catch(console.error);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const cents = Math.round(parseFloat(amount) * 100);
    if (!amount || isNaN(cents) || cents <= 0) {
      setError('Enter a valid positive amount');
      return;
    }
    if (!categoryId) {
      setError('Select a category');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ type, amount_cents: cents, category_id: categoryId, date, note });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || 'Failed to save transaction';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error">{error}</div>}

      <div className="form-group">
        <label>Type</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className={`btn ${type === 'expense' ? 'btn-danger' : 'btn-outline'}`}
            style={{ flex: 1 }}
            onClick={() => setType('expense')}
          >
            Expense
          </button>
          <button
            type="button"
            className={`btn ${type === 'income' ? 'btn-success' : 'btn-outline'}`}
            style={{ flex: 1 }}
            onClick={() => setType('income')}
          >
            Income
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="txAmount">Amount ($)</label>
        <input
          id="txAmount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="txCategory">Category</label>
        <select
          id="txCategory"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
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
        <label htmlFor="txDate">Date</label>
        <input
          id="txDate"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="txNote">Note</label>
        <input
          id="txNote"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note"
        />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button
          type="button"
          className="btn btn-outline"
          style={{ flex: 1 }}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ flex: 1 }}
          disabled={loading}
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

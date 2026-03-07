import { useState, useEffect } from 'react';
import type { Category } from '../../api/categoryClient';
import { listCategories } from '../../api/categoryClient';

export interface FilterState {
  from: string;
  to: string;
  category_id: string;
  type: '' | 'expense' | 'income';
  search: string;
}

interface TransactionFiltersProps {
  value: FilterState;
  onChange: (filters: FilterState) => void;
}

export function TransactionFilters({ value, onChange }: TransactionFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    listCategories().then(setCategories).catch(console.error);
  }, []);

  const update = (patch: Partial<FilterState>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <div className="filter-bar">
      <div className="filter-row">
        <input
          type="text"
          className="filter-input"
          placeholder="Search notes…"
          value={value.search}
          onChange={(e) => update({ search: e.target.value })}
        />
        <select
          className="filter-input"
          value={value.category_id}
          onChange={(e) => update({ category_id: e.target.value })}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="filter-input"
          value={value.type}
          onChange={(e) =>
            update({ type: e.target.value as FilterState['type'] })
          }
        >
          <option value="">All types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>
      <div className="filter-row">
        <input
          type="date"
          className="filter-input"
          value={value.from}
          onChange={(e) => update({ from: e.target.value })}
        />
        <span className="filter-separator">to</span>
        <input
          type="date"
          className="filter-input"
          value={value.to}
          onChange={(e) => update({ to: e.target.value })}
        />
      </div>
    </div>
  );
}

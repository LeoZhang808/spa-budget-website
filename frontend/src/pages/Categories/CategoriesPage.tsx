import { useState, useEffect, type FormEvent } from 'react';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../api/categoryClient';
import type { Category } from '../../api/categoryClient';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import './Categories.css';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await listCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError('');
    try {
      await createCategory(newName.trim());
      setNewName('');
      fetchData();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || 'Failed to create category';
      setError(msg);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editName.trim()) return;
    setError('');
    try {
      await updateCategory(id, editName.trim());
      setEditingId(null);
      fetchData();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || 'Failed to update category';
      setError(msg);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      fetchData();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || 'Cannot delete this category';
      setError(msg);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="categories-page">
      <div className="page-header">
        <h1>Categories</h1>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form className="add-category-form" onSubmit={handleCreate}>
        <input
          type="text"
          className="filter-input"
          placeholder="New category name…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <button className="btn btn-primary" type="submit">
          Add Category
        </button>
      </form>

      {categories.length === 0 ? (
        <EmptyState message="No categories yet" />
      ) : (
        <div className="categories-list">
          {categories.map((cat) => (
            <div className="category-item" key={cat.id}>
              {editingId === cat.id ? (
                <div className="category-edit">
                  <input
                    type="text"
                    className="filter-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(cat.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleSaveEdit(cat.id)}
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="category-name">
                    {cat.name}
                    {cat.is_system && (
                      <span className="system-badge">System</span>
                    )}
                  </div>
                  <div className="action-btns">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => startEdit(cat)}
                    >
                      Edit
                    </button>
                    {!cat.is_system && (
                      <button
                        className="btn btn-sm btn-danger-outline"
                        onClick={() => handleDelete(cat.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

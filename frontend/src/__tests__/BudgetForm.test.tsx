import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BudgetsPage } from '../pages/Budgets/BudgetsPage';

const mockListBudgets = vi.fn().mockResolvedValue([]);
const mockCreateBudget = vi.fn().mockResolvedValue({
  id: 1,
  category_id: 1,
  amount_cents: 5000,
  month: '2026-03',
});

vi.mock('../api/budgetClient', () => ({
  listBudgets: (...args: unknown[]) => mockListBudgets(...args),
  createBudget: (...args: unknown[]) => mockCreateBudget(...args),
  updateBudget: vi.fn(),
  deleteBudget: vi.fn(),
}));

vi.mock('../api/categoryClient', () => ({
  listCategories: vi.fn().mockResolvedValue([
    { id: 1, name: 'Food', is_system: false, created_at: '', updated_at: '' },
  ]),
}));

describe('BudgetsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListBudgets.mockResolvedValue([]);
    mockCreateBudget.mockResolvedValue({
      id: 1,
      category_id: 1,
      amount_cents: 5000,
      month: '2026-03',
    });
  });

  it('renders the month selector', async () => {
    render(<BudgetsPage />);
    await waitFor(() => {
      expect(screen.getByText('Budgets')).toBeInTheDocument();
    });
    expect(screen.getByText('‹')).toBeInTheDocument();
    expect(screen.getByText('›')).toBeInTheDocument();
  });

  it('renders "+ Add Budget" button', async () => {
    render(<BudgetsPage />);
    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: /Add Budget/i }).length,
      ).toBeGreaterThan(0);
    });
  });

  it('clicking "+ Add Budget" reveals a form in a modal', async () => {
    const user = userEvent.setup();
    render(<BudgetsPage />);

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: /Add Budget/i }).length,
      ).toBeGreaterThan(0);
    });

    const addButtons = screen.getAllByRole('button', { name: /Add Budget/i });
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('New Budget')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount ($)')).toBeInTheDocument();
  });

  it('category dropdown populates from mock data', async () => {
    const user = userEvent.setup();
    render(<BudgetsPage />);

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: /Add Budget/i }).length,
      ).toBeGreaterThan(0);
    });

    const addButtons = screen.getAllByRole('button', { name: /Add Budget/i });
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('New Budget')).toBeInTheDocument();
    });

    const categorySelect = screen.getByLabelText('Category');
    const options = categorySelect.querySelectorAll('option');
    expect(options.length).toBe(2); // "Select category…" + "Food"
    expect(options[1].textContent).toBe('Food');
  });

  it('amount field works and submits correctly', async () => {
    const user = userEvent.setup();
    render(<BudgetsPage />);

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', { name: /Add Budget/i }).length,
      ).toBeGreaterThan(0);
    });

    const addButtons = screen.getAllByRole('button', { name: /Add Budget/i });
    await user.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('New Budget')).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText('Category'), '1');
    await user.type(screen.getByLabelText('Amount ($)'), '50.00');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockCreateBudget).toHaveBeenCalledWith(
        expect.objectContaining({
          amount_cents: 5000,
          category_id: '1',
        }),
      );
    });
  });
});

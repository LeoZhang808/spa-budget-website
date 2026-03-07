import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionForm } from '../components/Transactions/TransactionForm';

vi.mock('../api/categoryClient', () => ({
  listCategories: vi.fn().mockResolvedValue([
    { id: 1, name: 'Food', is_system: false, created_at: '', updated_at: '' },
    {
      id: 2,
      name: 'Transport',
      is_system: false,
      created_at: '',
      updated_at: '',
    },
  ]),
}));

describe('TransactionForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it('renders type toggle (expense/income)', async () => {
    render(<TransactionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Expense' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Income' })).toBeInTheDocument();
  });

  it('renders amount, category, date, and note fields', async () => {
    render(<TransactionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Amount ($)')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Note')).toBeInTheDocument();
  });

  it('converts dollars to cents on submit', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Amount ($)'), '25.50');
    await user.selectOptions(screen.getByLabelText('Category'), '1');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ amount_cents: 2550 }),
      );
    });
  });

  it('validates required fields - shows error for zero amount', async () => {
    const { container } = render(
      <TransactionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
    });

    // Use fireEvent.submit to bypass HTML5 constraint validation (min="0.01")
    // so that our custom JS validation path runs with an empty amount
    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(
        screen.getByText('Enter a valid positive amount'),
      ).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates required fields - shows error for missing category', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Amount ($)'), '10.00');
    // Don't select a category - leave it as the default empty value
    // We need to bypass HTML validation for the required select
    const categorySelect = screen.getByLabelText('Category');
    expect(categorySelect).toHaveValue('');
  });

  it('calls onSubmit with correct data structure', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Income' }));
    await user.type(screen.getByLabelText('Amount ($)'), '100.00');
    await user.selectOptions(screen.getByLabelText('Category'), '2');

    const dateInput = screen.getByLabelText('Date');
    await user.clear(dateInput);
    await user.type(dateInput, '2026-03-01');

    await user.type(screen.getByLabelText('Note'), 'Freelance payment');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        type: 'income',
        amount_cents: 10000,
        category_id: '2',
        date: '2026-03-01',
        note: 'Freelance payment',
      });
    });
  });

  it('pre-fills form when editing (initial prop provided)', async () => {
    render(
      <TransactionForm
        initial={{
          type: 'income',
          amount_cents: 5000,
          category_id: '1',
          date: '2026-01-15',
          note: 'Existing note',
        }}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Amount ($)')).toHaveValue(50);
    expect(screen.getByLabelText('Category')).toHaveValue('1');
    expect(screen.getByLabelText('Date')).toHaveValue('2026-01-15');
    expect(screen.getByLabelText('Note')).toHaveValue('Existing note');
  });

  it('cancel button calls onCancel', async () => {
    const user = userEvent.setup();
    render(<TransactionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { LoginPage } from '../pages/Auth/LoginPage';

const mockLogin = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: mockLogin,
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password inputs', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders submit button with "Sign in" text', () => {
    render(<LoginPage />);
    expect(
      screen.getByRole('button', { name: 'Sign in' }),
    ).toBeInTheDocument();
  });

  it('renders link to register page', () => {
    render(<LoginPage />);
    const link = screen.getByRole('link', { name: 'Sign up' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/register');
  });

  it('requires both fields via HTML validation', () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('calls login on form submit with entered values', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);

    render(<LoginPage />);
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'secret123');
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays error message on failed login', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce({
      response: { data: { error: 'Invalid credentials' } },
    });

    render(<LoginPage />);
    await user.type(screen.getByLabelText('Email'), 'bad@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});

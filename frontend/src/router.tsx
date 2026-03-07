import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './components/Layout/AppLayout';
import { LoginPage } from './pages/Auth/LoginPage';
import { RegisterPage } from './pages/Auth/RegisterPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { TransactionsPage } from './pages/Transactions/TransactionsPage';
import { BudgetsPage } from './pages/Budgets/BudgetsPage';
import { CategoriesPage } from './pages/Categories/CategoriesPage';
import { ProfilePage } from './pages/Settings/ProfilePage';
import { LoadingSpinner } from './components/common/LoadingSpinner';

function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function PublicRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/transactions', element: <TransactionsPage /> },
      { path: '/budgets', element: <BudgetsPage /> },
      { path: '/categories', element: <CategoriesPage /> },
      { path: '/settings', element: <ProfilePage /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

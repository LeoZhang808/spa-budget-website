import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { ReactNode } from 'react';
import './AppLayout.css';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '◈' },
  { to: '/transactions', label: 'Transactions', icon: '⇄' },
  { to: '/budgets', label: 'Budgets', icon: '▣' },
  { to: '/categories', label: 'Categories', icon: '▦' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">$</span>
          <span className="brand-text">BudgetApp</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item--active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-title">BudgetApp</div>
          <div className="topbar-user">
            <span className="user-name">
              {user?.display_name || user?.email || 'User'}
            </span>
            <button className="btn-logout" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </header>
        <main className="main-content">{children}</main>
      </div>

      <nav className="bottom-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? 'bottom-nav-item--active' : ''}`
            }
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

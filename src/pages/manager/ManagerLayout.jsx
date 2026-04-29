import { Link, useLocation, useNavigate } from 'react-router-dom';

const navLinks = [
  { path: '/manager', label: '🏠 Home' },
  { path: '/manager/employees', label: '👥 Employees' },
  { path: '/manager/customers', label: '🧑 Customers' },
  { path: '/manager/accounts', label: '🏦 Accounts' },
  { path: '/manager/transactions', label: '💸 Transactions' },
  { path: '/manager/loans', label: '💼 Loans' },
  { path: '/manager/fraud', label: '🚨 Fraud Logs' },
  { path: '/manager/approvals', label: '✅ Approvals' },
];

export default function ManagerLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
        <span className="navbar-brand fw-bold">🏦 SmartBank Manager</span>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#managerNav"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="managerNav">
          <ul className="navbar-nav me-auto">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.path}>
                <Link
                  to={link.path}
                  className={`nav-link ${location.pathname === link.path ? 'active fw-bold' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <button
            className="btn btn-outline-light btn-sm"
            onClick={() => navigate('/')}
          >
            ← Exit
          </button>
        </div>
      </nav>
      <div className="container mt-4">{children}</div>
    </div>
  );
}

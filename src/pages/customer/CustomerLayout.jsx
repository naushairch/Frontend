import { Link, useLocation, useNavigate } from 'react-router-dom';

const navLinks = [
  { path: '/customer/home',         label: '🏠 Home' },
  { path: '/customer/accounts',     label: '🏦 My Accounts' },
  { path: '/customer/transactions', label: '💸 Transactions' },
  { path: '/customer/loans',        label: '💼 My Loans' },
];

export default function CustomerLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const name = localStorage.getItem('customerName') || 'Customer';

  const handleLogout = () => {
    localStorage.removeItem('customerId');
    localStorage.removeItem('customerName');
    localStorage.removeItem('customerStatus');
    navigate('/customer');
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-3">
        <span className="navbar-brand fw-bold">🏦 SmartBank</span>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#customerNav"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="customerNav">
          <ul className="navbar-nav me-auto">
            {navLinks.map(link => (
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
          <span className="navbar-text text-white me-3">
            👤 {name}
          </span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      <div className="container mt-4">{children}</div>
    </div>
  );
}

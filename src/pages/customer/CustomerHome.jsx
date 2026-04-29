import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from './CustomerLayout';
import apiClient from '../../api/axiosconfig';

export default function CustomerHome() {
  const navigate = useNavigate();
  const customerId = localStorage.getItem('customerId');
  const name = localStorage.getItem('customerName') || 'Customer';
  const status = localStorage.getItem('customerStatus');

  const [profile, setProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!customerId) { navigate('/customer'); return; }
    const fetchAll = async () => {
      try {
        const [profRes, accRes, loanRes] = await Promise.allSettled([
          apiClient.get(`/customers/${customerId}`),
          apiClient.get('/accounts'),
          apiClient.get('/loans'),
        ]);
        if (profRes.status === 'fulfilled') setProfile(profRes.value.data);
        if (accRes.status === 'fulfilled') {
          setAccounts(accRes.value.data.filter(a => a.CustomerID == customerId));
        }
        if (loanRes.status === 'fulfilled') {
          setLoans(loanRes.value.data.filter(l => l.CustomerID == customerId));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [customerId, navigate]);

  if (loading) return <CustomerLayout><p className="text-muted">Loading...</p></CustomerLayout>;

  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.Balance || 0), 0);
  const activeLoans = loans.filter(l => l.LoanStatusName === 'Active');

  return (
    <CustomerLayout>
      <h2 className="mb-1">Welcome, {name}! 👋</h2>
      {status === 'Blacklisted' && (
        <div className="alert alert-danger">⚠️ Your account has been blacklisted. Please contact the bank.</div>
      )}
      <p className="text-muted mb-4">Here's a summary of your banking profile.</p>

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-md-3">
          <div className="card border-primary text-center p-3">
            <div style={{ fontSize: '2rem' }}>🏦</div>
            <h3 className="text-primary fw-bold">{accounts.length}</h3>
            <p className="mb-0 text-muted small">Accounts</p>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className="card border-success text-center p-3">
            <div style={{ fontSize: '2rem' }}>💰</div>
            <h3 className="text-success fw-bold">${totalBalance.toLocaleString()}</h3>
            <p className="mb-0 text-muted small">Total Balance</p>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className="card border-warning text-center p-3">
            <div style={{ fontSize: '2rem' }}>💼</div>
            <h3 className="text-warning fw-bold">{activeLoans.length}</h3>
            <p className="mb-0 text-muted small">Active Loans</p>
          </div>
        </div>
        <div className="col-sm-6 col-md-3">
          <div className="card border-info text-center p-3">
            <div style={{ fontSize: '2rem' }}>📊</div>
            <h3 className="text-info fw-bold">{profile?.CreditScore ?? '—'}</h3>
            <p className="mb-0 text-muted small">Credit Score</p>
          </div>
        </div>
      </div>

      {/* Profile info */}
      {profile && (
        <div className="card p-3 mb-4">
          <h5 className="mb-3">👤 Your Profile</h5>
          <div className="row">
            <div className="col-md-4"><strong>Full Name:</strong> {profile.FirstName} {profile.LastName}</div>
            <div className="col-md-4"><strong>Email:</strong> {profile.Email}</div>
            <div className="col-md-4"><strong>Phone:</strong> {profile.Phone}</div>
            <div className="col-md-4 mt-2"><strong>Customer Type:</strong> {profile.CustomerType}</div>
            <div className="col-md-4 mt-2"><strong>Date of Birth:</strong> {profile.DOB?.split('T')[0]}</div>
            <div className="col-md-4 mt-2">
              <strong>Status:</strong>{' '}
              <span className={`badge bg-${profile.CustomerStatus === 'Active' ? 'success' : 'danger'}`}>
                {profile.CustomerStatus}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Accounts quick view */}
      {accounts.length > 0 && (
        <div className="card p-3">
          <h5 className="mb-3">🏦 Your Accounts</h5>
          <div className="table-responsive">
            <table className="table table-sm table-bordered">
              <thead className="table-primary">
                <tr><th>Account ID</th><th>Type</th><th>Ownership</th><th>Balance</th><th>Status</th></tr>
              </thead>
              <tbody>
                {accounts.map(a => (
                  <tr key={a.AccountID}>
                    <td>{a.AccountID}</td>
                    <td>{a.AccountTypeName}</td>
                    <td>{a.AccountOwnershipType}</td>
                    <td>${Number(a.Balance || 0).toLocaleString()}</td>
                    <td>
                      <span className={`badge bg-${a.AccountStatus === 'Active' ? 'success' : a.AccountStatus === 'Frozen' ? 'primary' : 'warning text-dark'}`}>
                        {a.AccountStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}

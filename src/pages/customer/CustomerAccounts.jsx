import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from './CustomerLayout';
import apiClient from '../../api/axiosconfig';

export default function CustomerAccounts() {
  const navigate = useNavigate();
  const customerId = localStorage.getItem('customerId');

  const [accounts, setAccounts] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!customerId) { navigate('/customer'); return; }
    load();
  }, [customerId, navigate]);

  const load = async () => {
    try {
      const r = await apiClient.get('/accounts');
      setAccounts(r.data.filter(a => a.CustomerID == customerId));
    } catch { setMsg('Failed to load accounts'); }
  };

  const statusBadge = (s) => {
    const map = { Active: 'success', Frozen: 'primary', 'Under Review': 'warning text-dark' };
    return <span className={`badge bg-${map[s] || 'secondary'}`}>{s}</span>;
  };

  return (
    <CustomerLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>🏦 My Accounts</h3>
      </div>

      {msg && <div className="alert alert-info py-2">{msg}</div>}

      {/* Info: accounts are opened by the bank manager */}
      <div className="alert alert-info py-2 mb-3">
        <strong>ℹ️ Need a new account?</strong> Please visit your branch or contact a bank manager to open a new account.
      </div>

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <div className="alert alert-secondary">You have no accounts yet. Contact your branch to get started.</div>
      ) : (
        <div className="row g-3">
          {accounts.map(a => (
            <div className="col-md-6" key={a.AccountID}>
              <div className={`card p-3 border-${a.AccountStatus === 'Active' ? 'success' : a.AccountStatus === 'Frozen' ? 'primary' : 'warning'}`}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="mb-0">Account #{a.AccountID}</h5>
                    <span className="text-muted small">{a.AccountTypeName} · {a.AccountOwnershipType}</span>
                  </div>
                  {statusBadge(a.AccountStatus)}
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between">
                  <span className="text-muted small">Balance</span>
                  <strong className="text-success">${Number(a.Balance || 0).toLocaleString()}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted small">Risk Score</span>
                  <span className={`badge bg-${(a.RiskScore || 0) > 80 ? 'danger' : (a.RiskScore || 0) > 50 ? 'warning text-dark' : 'success'}`}>
                    {a.RiskScore || 0}
                  </span>
                </div>
                {a.AccountStatus === 'Frozen' && (
                  <div className="alert alert-primary py-1 mt-2 mb-0 small">
                    🔒 This account is frozen. Contact the bank for assistance.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </CustomerLayout>
  );
}

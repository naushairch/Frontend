import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from './CustomerLayout';
import apiClient from '../../api/axiosconfig';

// Valid ownership types per SQL CHECK constraint
const OWNERSHIP_TYPES = ['Private', 'Joint'];

export default function CustomerAccounts() {
  const navigate = useNavigate();
  const customerId = localStorage.getItem('customerId');

  const [accounts, setAccounts] = useState([]);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    AccountTypeName: '',
    AccountOwnershipType: 'Private',
    Balance: '',
    DateCreated: new Date().toISOString().split('T')[0],
    SupervisorID: '',
  });

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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/accounts', { ...form, CustomerID: customerId });
      setMsg('Account created successfully!');
      setShowForm(false);
      setForm({ AccountTypeName: '', AccountOwnershipType: 'Private', Balance: '', DateCreated: new Date().toISOString().split('T')[0], SupervisorID: '' });
      load();
    } catch (err) { setMsg(err.response?.data?.message || 'Error creating account'); }
  };

  const statusBadge = (s) => {
    const map = { Active: 'success', Frozen: 'primary', 'Under Review': 'warning text-dark' };
    return <span className={`badge bg-${map[s] || 'secondary'}`}>{s}</span>;
  };

  return (
    <CustomerLayout>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>🏦 My Accounts</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '➕ Open New Account'}
        </button>
      </div>

      {msg && <div className="alert alert-info py-2">{msg}</div>}

      {/* Open Account Form */}
      {showForm && (
        <div className="card p-3 mb-4">
          <h5>➕ Open a New Account</h5>
          <p className="text-muted small mb-2">
            ⚠️ <strong>Account Type</strong> must be a valid type in the bank system (e.g. <code>Savings</code>, <code>Checking</code>, <code>Business</code>, <code>Fixed Deposit</code>).
          </p>
          <form onSubmit={handleCreate} className="row g-2">
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Account Type Name</label>
              <input className="form-control" placeholder="e.g. Savings"
                value={form.AccountTypeName}
                onChange={e => setForm({ ...form, AccountTypeName: e.target.value })} required />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Ownership Type</label>
              {/* CHECK: AccountOwnershipType IN ('Private','Joint') */}
              <select className="form-select" value={form.AccountOwnershipType}
                onChange={e => setForm({ ...form, AccountOwnershipType: e.target.value })}>
                <option value="Private">Private</option>
                <option value="Joint">Joint</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Initial Deposit</label>
              <input className="form-control" placeholder="0.00" type="number" step="0.01"
                value={form.Balance}
                onChange={e => setForm({ ...form, Balance: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Date</label>
              <input className="form-control" type="date"
                value={form.DateCreated}
                onChange={e => setForm({ ...form, DateCreated: e.target.value })} required />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Supervisor Employee ID</label>
              <input className="form-control" placeholder="Assigned supervisor ID" type="number"
                value={form.SupervisorID}
                onChange={e => setForm({ ...form, SupervisorID: e.target.value })} required />
            </div>
            <div className="col-12">
              <button className="btn btn-success" type="submit">Open Account</button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <div className="alert alert-secondary">You have no accounts yet. Click "Open New Account" to get started.</div>
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

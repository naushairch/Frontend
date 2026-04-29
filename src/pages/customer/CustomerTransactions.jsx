import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from './CustomerLayout';
import apiClient from '../../api/axiosconfig';

export default function CustomerTransactions() {
  const navigate = useNavigate();
  const customerId = localStorage.getItem('customerId');

  const [myAccounts, setMyAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [tab, setTab] = useState('history');
  const [msg, setMsg] = useState('');

  const [depForm, setDepForm] = useState({ AccountID: '', Amount: '', Purpose: '', Location: '' });
  const [withForm, setWithForm] = useState({ AccountID: '', Amount: '', Purpose: '', Location: '' });
  const [transForm, setTransForm] = useState({ FromAccountID: '', ToAccountID: '', Amount: '', Purpose: '', Location: '' });

  useEffect(() => {
    if (!customerId) { navigate('/customer'); return; }
    loadAccounts();
  }, [customerId, navigate]);

  const loadAccounts = async () => {
    try {
      const r = await apiClient.get('/accounts');
      const mine = r.data.filter(a => a.CustomerID == customerId);
      setMyAccounts(mine);
      if (mine.length > 0) {
        setSelectedAccount(mine[0].AccountID);
        setDepForm(f => ({ ...f, AccountID: mine[0].AccountID }));
        setWithForm(f => ({ ...f, AccountID: mine[0].AccountID }));
        setTransForm(f => ({ ...f, FromAccountID: mine[0].AccountID }));
        loadTransactions(mine[0].AccountID);
      }
    } catch { setMsg('Failed to load accounts'); }
  };

  const loadTransactions = async (accountId) => {
    try {
      const r = await apiClient.get(`/transactions/account/${accountId}`);
      setTransactions(r.data);
    } catch { setTransactions([]); }
  };

  const handleAccountSwitch = (accountId) => {
    setSelectedAccount(accountId);
    loadTransactions(accountId);
  };

  const doDeposit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/transactions/deposit', depForm);
      setMsg('✅ Deposit successful!');
      loadTransactions(selectedAccount);
      loadAccounts();
    } catch (err) { setMsg('❌ ' + (err.response?.data?.message || 'Deposit failed')); }
  };

  const doWithdraw = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/transactions/withdrawal', withForm);
      setMsg('✅ Withdrawal successful!');
      loadTransactions(selectedAccount);
      loadAccounts();
    } catch (err) { setMsg('❌ ' + (err.response?.data?.message || 'Withdrawal failed')); }
  };

  const doTransfer = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/transactions/transfer', transForm);
      setMsg('✅ Transfer successful!');
      loadTransactions(selectedAccount);
      loadAccounts();
    } catch (err) { setMsg('❌ ' + (err.response?.data?.message || 'Transfer failed')); }
  };

  const txBadge = (type) => {
    const map = { Deposit: 'success', Withdrawal: 'danger', Transfer: 'primary' };
    return <span className={`badge bg-${map[type] || 'secondary'}`}>{type}</span>;
  };

  return (
    <CustomerLayout>
      <h3>💸 Transactions</h3>
      {msg && (
        <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-danger'} py-2`}>
          {msg}
        </div>
      )}

      {myAccounts.length === 0 ? (
        <div className="alert alert-secondary">You have no accounts yet. Open one first from My Accounts.</div>
      ) : (
        <>
          {/* Account selector */}
          <div className="mb-3 d-flex align-items-center gap-2">
            <label className="fw-semibold me-1">Account:</label>
            {myAccounts.map(a => (
              <button
                key={a.AccountID}
                className={`btn btn-sm ${selectedAccount == a.AccountID ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleAccountSwitch(a.AccountID)}
              >
                #{a.AccountID} · {a.AccountTypeName} · ${Number(a.Balance || 0).toLocaleString()}
              </button>
            ))}
          </div>

          {/* Tabs */}
          <ul className="nav nav-tabs mb-3">
            {[['history','📋 History'],['deposit','💰 Deposit'],['withdraw','💳 Withdraw'],['transfer','🔄 Transfer']].map(([k,l]) => (
              <li className="nav-item" key={k}>
                <button className={`nav-link ${tab===k?'active':''}`} onClick={() => setTab(k)}>{l}</button>
              </li>
            ))}
          </ul>

          {/* Transaction History */}
          {tab === 'history' && (
            <div className="table-responsive">
              <table className="table table-sm table-bordered table-hover">
                <thead className="table-primary">
                  <tr><th>ID</th><th>Type</th><th>Amount</th><th>Purpose</th><th>Location</th><th>Date</th><th>Flagged</th></tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.TransactionID} className={t.IsFlagged ? 'table-danger' : ''}>
                      <td>{t.TransactionID}</td>
                      <td>{txBadge(t.TransactionTypeName)}</td>
                      <td>
                        <span className={t.TransactionTypeName === 'Deposit' ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                          {t.TransactionTypeName === 'Deposit' ? '+' : '-'}${Number(t.Amount || 0).toLocaleString()}
                        </span>
                      </td>
                      <td>{t.Purpose || '—'}</td>
                      <td>{t.TransactionLocation || '—'}</td>
                      <td>{t.DateTime ? new Date(t.DateTime).toLocaleString() : ''}</td>
                      <td>{t.IsFlagged ? <span className="badge bg-danger">⚠️ Flagged</span> : '—'}</td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr><td colSpan={7} className="text-center text-muted">No transactions for this account</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Deposit */}
          {tab === 'deposit' && (
            <div className="card p-3" style={{ maxWidth: 480 }}>
              <h5>💰 Make a Deposit</h5>
              <form onSubmit={doDeposit} className="row g-2">
                <div className="col-6">
                  <label className="form-label small">Account</label>
                  <select className="form-select" value={depForm.AccountID}
                    onChange={e => setDepForm({ ...depForm, AccountID: e.target.value })}>
                    {myAccounts.map(a => (
                      <option key={a.AccountID} value={a.AccountID}>
                        #{a.AccountID} — {a.AccountTypeName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small">Amount</label>
                  <input className="form-control" placeholder="0.00" type="number" step="0.01" min="1"
                    value={depForm.Amount} onChange={e => setDepForm({ ...depForm, Amount: e.target.value })} required />
                </div>
                <div className="col-6">
                  <label className="form-label small">Purpose</label>
                  <input className="form-control" placeholder="e.g. Salary"
                    value={depForm.Purpose} onChange={e => setDepForm({ ...depForm, Purpose: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small">Location</label>
                  <input className="form-control" placeholder="e.g. Branch A"
                    value={depForm.Location} onChange={e => setDepForm({ ...depForm, Location: e.target.value })} />
                </div>
                <div className="col-12">
                  <button className="btn btn-success" type="submit">Deposit</button>
                </div>
              </form>
            </div>
          )}

          {/* Withdraw */}
          {tab === 'withdraw' && (
            <div className="card p-3" style={{ maxWidth: 480 }}>
              <h5>💳 Withdraw</h5>
              <form onSubmit={doWithdraw} className="row g-2">
                <div className="col-6">
                  <label className="form-label small">Account</label>
                  <select className="form-select" value={withForm.AccountID}
                    onChange={e => setWithForm({ ...withForm, AccountID: e.target.value })}>
                    {myAccounts.map(a => (
                      <option key={a.AccountID} value={a.AccountID}>
                        #{a.AccountID} — ${Number(a.Balance || 0).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small">Amount</label>
                  <input className="form-control" placeholder="0.00" type="number" step="0.01" min="1"
                    value={withForm.Amount} onChange={e => setWithForm({ ...withForm, Amount: e.target.value })} required />
                </div>
                <div className="col-6">
                  <label className="form-label small">Purpose</label>
                  <input className="form-control" placeholder="e.g. Rent"
                    value={withForm.Purpose} onChange={e => setWithForm({ ...withForm, Purpose: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small">Location</label>
                  <input className="form-control" placeholder="e.g. ATM"
                    value={withForm.Location} onChange={e => setWithForm({ ...withForm, Location: e.target.value })} />
                </div>
                <div className="col-12">
                  <button className="btn btn-danger" type="submit">Withdraw</button>
                </div>
              </form>
            </div>
          )}

          {/* Transfer */}
          {tab === 'transfer' && (
            <div className="card p-3" style={{ maxWidth: 540 }}>
              <h5>🔄 Transfer Funds</h5>
              <form onSubmit={doTransfer} className="row g-2">
                <div className="col-6">
                  <label className="form-label small">From Account</label>
                  <select className="form-select" value={transForm.FromAccountID}
                    onChange={e => setTransForm({ ...transForm, FromAccountID: e.target.value })}>
                    {myAccounts.map(a => (
                      <option key={a.AccountID} value={a.AccountID}>
                        #{a.AccountID} — ${Number(a.Balance || 0).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small">To Account ID</label>
                  <input className="form-control" placeholder="Recipient Account ID" type="number"
                    value={transForm.ToAccountID}
                    onChange={e => setTransForm({ ...transForm, ToAccountID: e.target.value })} required />
                </div>
                <div className="col-4">
                  <label className="form-label small">Amount</label>
                  <input className="form-control" placeholder="0.00" type="number" step="0.01" min="1"
                    value={transForm.Amount}
                    onChange={e => setTransForm({ ...transForm, Amount: e.target.value })} required />
                </div>
                <div className="col-4">
                  <label className="form-label small">Purpose</label>
                  <input className="form-control" placeholder="e.g. Rent"
                    value={transForm.Purpose}
                    onChange={e => setTransForm({ ...transForm, Purpose: e.target.value })} />
                </div>
                <div className="col-4">
                  <label className="form-label small">Location</label>
                  <input className="form-control" placeholder="e.g. Online"
                    value={transForm.Location}
                    onChange={e => setTransForm({ ...transForm, Location: e.target.value })} />
                </div>
                <div className="col-12">
                  <button className="btn btn-primary" type="submit">Transfer</button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </CustomerLayout>
  );
}

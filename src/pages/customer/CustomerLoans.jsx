import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from './CustomerLayout';
import apiClient from '../../api/axiosconfig';

export default function CustomerLoans() {
  const navigate = useNavigate();
  const customerId = localStorage.getItem('customerId');

  const [loans, setLoans] = useState([]);
  const [myAccounts, setMyAccounts] = useState([]);
  const [summary, setSummary] = useState([]);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('loans');
  const [payForm, setPayForm] = useState({ LoanID: '', AccountID: '', PaymentAmount: '' });

  useEffect(() => {
    if (!customerId) { navigate('/customer'); return; }
    loadAll();
  }, [customerId, navigate]);

  const loadAll = async () => {
    try {
      const [loanRes, accRes, sumRes] = await Promise.allSettled([
        apiClient.get('/loans'),
        apiClient.get('/accounts'),
        apiClient.get('/loans/views/summary'),
      ]);
      if (loanRes.status === 'fulfilled')
        setLoans(loanRes.value.data.filter(l => l.CustomerID == customerId));
      if (accRes.status === 'fulfilled')
        setMyAccounts(accRes.value.data.filter(a => a.CustomerID == customerId));
      if (sumRes.status === 'fulfilled')
        setSummary(sumRes.value.data.filter(s => s.CustomerID == customerId));
    } catch { setMsg('Failed to load loans'); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/loans/payment', payForm);
      setMsg('✅ Payment processed!');
      setPayForm({ LoanID: '', AccountID: '', PaymentAmount: '' });
      loadAll();
    } catch (err) { setMsg('❌ ' + (err.response?.data?.message || 'Payment failed')); }
  };

  const loanStatusBadge = (s) => {
    const map = { Active: 'success', Completed: 'secondary', Defaulted: 'danger', Pending: 'warning text-dark' };
    return <span className={`badge bg-${map[s] || 'secondary'}`}>{s}</span>;
  };

  return (
    <CustomerLayout>
      <h3>💼 My Loans</h3>
      {msg && (
        <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-danger'} py-2`}>
          {msg}
        </div>
      )}

      <ul className="nav nav-tabs mb-3">
        {[['loans','My Loans'],['summary','Loan Summary'],['payment','Make Payment']].map(([k,l]) => (
          <li className="nav-item" key={k}>
            <button className={`nav-link ${tab===k?'active':''}`} onClick={() => setTab(k)}>{l}</button>
          </li>
        ))}
      </ul>

      {/* Loans list */}
      {tab === 'loans' && (
        <>
          {loans.length === 0 ? (
            <div className="alert alert-secondary">You have no loans on record.</div>
          ) : (
            <div className="row g-3">
              {loans.map(l => (
                <div className="col-md-6" key={l.LoanID}>
                  <div className={`card p-3 border-${l.LoanStatusName === 'Active' ? 'warning' : l.LoanStatusName === 'Completed' ? 'success' : 'danger'}`}>
                    <div className="d-flex justify-content-between">
                      <h5 className="mb-0">Loan #{l.LoanID}</h5>
                      {loanStatusBadge(l.LoanStatusName)}
                    </div>
                    <hr className="my-2" />
                    <div className="row g-1">
                      <div className="col-6">
                        <span className="text-muted small">Loan Amount</span>
                        <div className="fw-bold">${Number(l.LoanAmount || 0).toLocaleString()}</div>
                      </div>
                      <div className="col-6">
                        <span className="text-muted small">Interest Rate</span>
                        <div className="fw-bold">{l.InterestRate}%</div>
                      </div>
                      <div className="col-6">
                        <span className="text-muted small">Amount Paid</span>
                        <div className="fw-bold text-success">${Number(l.AmountPaid || 0).toLocaleString()}</div>
                      </div>
                      <div className="col-6">
                        <span className="text-muted small">Remaining</span>
                        <div className="fw-bold text-danger">
                          ${Math.max(0, Number(l.LoanAmount || 0) - Number(l.AmountPaid || 0)).toLocaleString()}
                        </div>
                      </div>
                      <div className="col-6">
                        <span className="text-muted small">Start</span>
                        <div>{l.StartDate?.split('T')[0] || '—'}</div>
                      </div>
                      <div className="col-6">
                        <span className="text-muted small">End</span>
                        <div>{l.EndDate?.split('T')[0] || '—'}</div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    {l.LoanAmount > 0 && (
                      <div className="mt-2">
                        <div className="d-flex justify-content-between small text-muted">
                          <span>Repayment Progress</span>
                          <span>{Math.round((Number(l.AmountPaid || 0) / Number(l.LoanAmount)) * 100)}%</span>
                        </div>
                        <div className="progress" style={{ height: 8 }}>
                          <div
                            className="progress-bar bg-success"
                            style={{ width: `${Math.min(100, (Number(l.AmountPaid || 0) / Number(l.LoanAmount)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Loan Summary View */}
      {tab === 'summary' && (
        <>
          {summary.length === 0 ? (
            <div className="alert alert-secondary">No summary data available.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <thead className="table-primary">
                  <tr><th>Customer</th><th>Total Loaned</th></tr>
                </thead>
                <tbody>
                  {summary.map((s, i) => (
                    <tr key={i}>
                      <td>{s.FirstName} {s.LastName}</td>
                      <td>${Number(s.TotalLoaned || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Make Payment */}
      {tab === 'payment' && (
        <div className="card p-3" style={{ maxWidth: 500 }}>
          <h5>💳 Make a Loan Payment</h5>
          {loans.filter(l => l.LoanStatusName === 'Active').length === 0 ? (
            <div className="alert alert-secondary mb-0">No active loans to pay.</div>
          ) : (
            <form onSubmit={handlePayment} className="row g-2">
              <div className="col-12">
                <label className="form-label small fw-semibold">Select Loan</label>
                <select className="form-select" value={payForm.LoanID}
                  onChange={e => setPayForm({ ...payForm, LoanID: e.target.value })} required>
                  <option value="">-- Choose a loan --</option>
                  {loans.filter(l => l.LoanStatusName === 'Active').map(l => (
                    <option key={l.LoanID} value={l.LoanID}>
                      Loan #{l.LoanID} — Remaining: ${Math.max(0, l.LoanAmount - (l.AmountPaid || 0)).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Pay From Account</label>
                <select className="form-select" value={payForm.AccountID}
                  onChange={e => setPayForm({ ...payForm, AccountID: e.target.value })} required>
                  <option value="">-- Choose account --</option>
                  {myAccounts.map(a => (
                    <option key={a.AccountID} value={a.AccountID}>
                      Account #{a.AccountID} — Balance: ${Number(a.Balance || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Payment Amount</label>
                <input className="form-control" placeholder="0.00" type="number" step="0.01" min="1"
                  value={payForm.PaymentAmount}
                  onChange={e => setPayForm({ ...payForm, PaymentAmount: e.target.value })} required />
              </div>
              <div className="col-12">
                <button className="btn btn-success" type="submit">Make Payment</button>
              </div>
            </form>
          )}
        </div>
      )}
    </CustomerLayout>
  );
}

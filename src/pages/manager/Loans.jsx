import { useEffect, useState } from 'react';
import ManagerLayout from './ManagerLayout';
import apiClient from '../../api/axiosconfig';

const EMPTY = { CustomerID: '', LoanAmount: '', InterestRate: '', StartDate: '', EndDate: '' };
const PAY_EMPTY = { LoanID: '', AccountID: '', PaymentAmount: '' };

export default function Loans() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [payForm, setPayForm] = useState(PAY_EMPTY);
  const [msg, setMsg] = useState('');
  const [view, setView] = useState('all');

  const load = async (v = 'all') => {
    setView(v);
    const endpoints = {
      all: '/loans',
      summary: '/loans/views/summary',
      'debt-free': '/loans/views/debt-free',
      'high-risk': '/loans/views/high-risk-with-loans',
    };
    try {
      const r = await apiClient.get(endpoints[v]);
      setList(r.data);
    } catch { setMsg('Failed to load'); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/loans', form);
      setMsg('Loan created!'); setForm(EMPTY); load();
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/loans/payment', payForm);
      setMsg('Payment processed!'); setPayForm(PAY_EMPTY); load();
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const cols = {
    all: ['LoanID','Customer','Amount','Interest','Start','End','Status'],
    summary: ['CustomerID','Name','TotalLoans','TotalAmount','TotalPaid','Balance'],
    'debt-free': ['CustomerID','Name'],
    'high-risk': ['CustomerID','Name','RiskScore','LoanAmount'],
  };

  return (
    <ManagerLayout>
      <h3>💼 Loans</h3>
      {msg && <div className="alert alert-info py-1">{msg}</div>}

      {/* View tabs */}
      <ul className="nav nav-tabs mb-3">
        {[['all','All Loans'],['summary','Summary'],['debt-free','Debt-Free'],['high-risk','High-Risk']].map(([k,l]) => (
          <li className="nav-item" key={k}>
            <button className={`nav-link ${view===k?'active':''}`} onClick={() => load(k)}>{l}</button>
          </li>
        ))}
      </ul>

      {view === 'all' && (
        <>
          {/* Create loan */}
          <div className="card mb-3 p-3">
            <h5>➕ New Loan</h5>
            <form onSubmit={handleCreate} className="row g-2">
              <div className="col-md-2"><input className="form-control" placeholder="Customer ID" type="number" value={form.CustomerID} onChange={e=>setForm({...form,CustomerID:e.target.value})} required /></div>
              <div className="col-md-2"><input className="form-control" placeholder="Amount" type="number" step="0.01" value={form.LoanAmount} onChange={e=>setForm({...form,LoanAmount:e.target.value})} required /></div>
              <div className="col-md-2"><input className="form-control" placeholder="Interest %" type="number" step="0.01" value={form.InterestRate} onChange={e=>setForm({...form,InterestRate:e.target.value})} required /></div>
              <div className="col-md-2"><input className="form-control" type="date" placeholder="Start" value={form.StartDate} onChange={e=>setForm({...form,StartDate:e.target.value})} required /></div>
              <div className="col-md-2"><input className="form-control" type="date" placeholder="End" value={form.EndDate} onChange={e=>setForm({...form,EndDate:e.target.value})} required /></div>
              <div className="col-md-2"><button className="btn btn-primary w-100" type="submit">Create</button></div>
            </form>
          </div>

          {/* Process payment */}
          <div className="card mb-3 p-3">
            <h5>💳 Process Payment</h5>
            <form onSubmit={handlePayment} className="row g-2">
              <div className="col-md-3"><input className="form-control" placeholder="Loan ID" type="number" value={payForm.LoanID} onChange={e=>setPayForm({...payForm,LoanID:e.target.value})} required /></div>
              <div className="col-md-3"><input className="form-control" placeholder="Account ID" type="number" value={payForm.AccountID} onChange={e=>setPayForm({...payForm,AccountID:e.target.value})} required /></div>
              <div className="col-md-3"><input className="form-control" placeholder="Amount" type="number" step="0.01" value={payForm.PaymentAmount} onChange={e=>setPayForm({...payForm,PaymentAmount:e.target.value})} required /></div>
              <div className="col-md-3"><button className="btn btn-success w-100" type="submit">Pay</button></div>
            </form>
          </div>
        </>
      )}

      <div className="table-responsive">
        <table className="table table-sm table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              {view === 'all' && <><th>Loan ID</th><th>Customer</th><th>Amount</th><th>Interest %</th><th>Start</th><th>End</th><th>Status</th><th>Amt Paid</th></>}
              {view === 'summary' && <><th>CustomerID</th><th>Name</th><th>Total Loans</th><th>Total Loaned</th><th>Paid</th><th>Remaining</th></>}
              {view === 'debt-free' && <><th>CustomerID</th><th>Name</th></>}
              {view === 'high-risk' && <><th>CustomerID</th><th>Name</th><th>Risk Score</th><th>Total Loan</th></>}
            </tr>
          </thead>
          <tbody>
            {list.map((row, i) => (
              <tr key={i}>
                {view === 'all' && <>
                  <td>{row.LoanID}</td>
                  <td>{row.FirstName} {row.LastName}</td>
                  <td>${Number(row.LoanAmount||0).toLocaleString()}</td>
                  <td>{row.InterestRate}%</td>
                  <td>{row.StartDate?.split('T')[0]}</td>
                  <td>{row.EndDate?.split('T')[0]}</td>
                  <td><span className={`badge bg-${row.LoanStatusName==='Active'?'success':row.LoanStatusName==='Completed'?'secondary':row.LoanStatusName==='Defaulted'?'danger':'warning text-dark'}`}>{row.LoanStatusName}</span></td>
                  <td>${Number(row.AmountPaid||0).toLocaleString()}</td>
                </>}
                {view === 'summary' && <>
                  <td>{row.CustomerID}</td><td>{row.FirstName} {row.LastName}</td>
                  <td>{row.TotalLoans}</td><td>${Number(row.TotalLoaned||0).toLocaleString()}</td>
                  <td>${Number(row.TotalPaid||0).toLocaleString()}</td><td>${Number(row.RemainingBalance||0).toLocaleString()}</td>
                </>}
                {view === 'debt-free' && <>
                  <td>{row.CustomerID}</td><td>{row.FirstName} {row.LastName}</td>
                </>}
                {view === 'high-risk' && <>
                  <td>{row.CustomerID}</td><td>{row.FirstName} {row.LastName}</td>
                  <td>{row.RiskScore}</td><td>${Number(row.LoanAmount||0).toLocaleString()}</td>
                </>}
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} className="text-center text-muted">No records</td></tr>}
          </tbody>
        </table>
      </div>
    </ManagerLayout>
  );
}

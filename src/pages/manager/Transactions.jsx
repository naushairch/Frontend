import { useEffect, useState } from 'react';
import ManagerLayout from './ManagerLayout';
import apiClient from '../../api/axiosconfig';

export default function Transactions() {
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState('');
  const [depForm, setDepForm] = useState({ AccountID: '', Amount: '', Purpose: '', Location: '' });
  const [withForm, setWithForm] = useState({ AccountID: '', Amount: '', Purpose: '', Location: '' });
  const [transForm, setTransForm] = useState({ FromAccountID: '', ToAccountID: '', Amount: '', Purpose: '', Location: '' });
  const [revForm, setRevForm] = useState({ TransactionID: '', Reason: '' });
  const [acctFilter, setAcctFilter] = useState('');
  const [tab, setTab] = useState('list');

  const load = async () => {
    try {
      const r = await apiClient.get('/transactions');
      setList(r.data);
    } catch { setMsg('Failed to load'); }
  };

  useEffect(() => { load(); }, []);

  const filterByAccount = async () => {
    if (!acctFilter) return load();
    try {
      const r = await apiClient.get(`/transactions/account/${acctFilter}`);
      setList(r.data);
    } catch { setMsg('Not found'); }
  };

  const doDeposit = async (e) => {
    e.preventDefault();
    try { await apiClient.post('/transactions/deposit', depForm); setMsg('Deposit done!'); setDepForm({ AccountID:'',Amount:'',Purpose:'',Location:'' }); load(); }
    catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };
  const doWithdraw = async (e) => {
    e.preventDefault();
    try { await apiClient.post('/transactions/withdrawal', withForm); setMsg('Withdrawal done!'); setWithForm({ AccountID:'',Amount:'',Purpose:'',Location:'' }); load(); }
    catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };
  const doTransfer = async (e) => {
    e.preventDefault();
    try { await apiClient.post('/transactions/transfer', transForm); setMsg('Transfer done!'); setTransForm({ FromAccountID:'',ToAccountID:'',Amount:'',Purpose:'',Location:'' }); load(); }
    catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };
  const doReverse = async (e) => {
    e.preventDefault();
    try { await apiClient.post('/transactions/reverse', revForm); setMsg('Reversed!'); setRevForm({ TransactionID:'',Reason:'' }); load(); }
    catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const runAction = async (endpoint, label) => {
    try { const r = await apiClient.post(endpoint); setMsg(r.data.message || `${label} complete!`); }
    catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  return (
    <ManagerLayout>
      <h3>💸 Transactions</h3>
      {msg && <div className="alert alert-info py-1">{msg}</div>}

      {/* Fraud/monitoring actions */}
      <div className="mb-3 d-flex gap-2 flex-wrap">
        <button className="btn btn-sm btn-danger" onClick={() => runAction('/transactions/actions/flag-withdrawals','Flag Withdrawals')}>🚩 Flag Excessive Withdrawals</button>
        <button className="btn btn-sm btn-warning" onClick={() => runAction('/transactions/actions/validate-purpose','Validate Purpose')}>🔍 Validate Purpose</button>
        <button className="btn btn-sm btn-info text-white" onClick={() => runAction('/transactions/actions/detect-rapid','Detect Rapid')}>⚡ Detect Rapid Transactions</button>
        <button className="btn btn-sm btn-dark" onClick={() => runAction('/transactions/actions/monitor-behavior','Monitor Behavior')}>🧠 Monitor Abnormal Behavior</button>
        <button className="btn btn-sm btn-primary" onClick={() => runAction('/transactions/actions/approval-workflow','Approval Workflow')}>📋 Trigger Approval Workflow</button>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        {['list','deposit','withdraw','transfer'].map(t => (
          <li className="nav-item" key={t}>
            <button className={`nav-link ${tab===t?'active':''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          </li>
        ))}
      </ul>

      {/* List tab */}
      {tab === 'list' && (
        <>
          <div className="input-group mb-3" style={{maxWidth:350}}>
            <input className="form-control" placeholder="Filter by Account ID..." type="number"
              value={acctFilter} onChange={e=>setAcctFilter(e.target.value)} />
            <button className="btn btn-outline-secondary" onClick={filterByAccount}>Filter</button>
            <button className="btn btn-outline-danger" onClick={() => { setAcctFilter(''); load(); }}>Clear</button>
          </div>
          <div className="table-responsive">
            <table className="table table-sm table-bordered table-hover">
              <thead className="table-dark">
                <tr><th>ID</th><th>Account</th><th>Type</th><th>Amount</th><th>Purpose</th><th>Location</th><th>DateTime</th></tr>
              </thead>
              <tbody>
                {list.map(t => (
                  <tr key={t.TransactionID}>
                    <td>{t.TransactionID}</td><td>{t.AccountID}</td>
                    <td><span className={`badge bg-${t.TransactionTypeName==='Deposit'?'success':t.TransactionTypeName==='Withdrawal'?'danger':t.TransactionTypeName==='Transfer'?'primary':'secondary'}`}>{t.TransactionTypeName}</span></td>
                    <td>${Number(t.Amount||0).toLocaleString()}</td>
                    <td>{t.Purpose}</td><td>{t.Location}</td>
                    <td>{t.DateTime ? new Date(t.DateTime).toLocaleString() : ''}</td>
                  </tr>
                ))}
                {list.length === 0 && <tr><td colSpan={7} className="text-center text-muted">No records</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'deposit' && (
        <div className="card p-3" style={{maxWidth:480}}>
          <h5>💰 Deposit</h5>
          <form onSubmit={doDeposit} className="row g-2">
            <div className="col-6"><input className="form-control" placeholder="Account ID" type="number" value={depForm.AccountID} onChange={e=>setDepForm({...depForm,AccountID:e.target.value})} required /></div>
            <div className="col-6"><input className="form-control" placeholder="Amount" type="number" step="0.01" value={depForm.Amount} onChange={e=>setDepForm({...depForm,Amount:e.target.value})} required /></div>
            <div className="col-6"><input className="form-control" placeholder="Purpose" value={depForm.Purpose} onChange={e=>setDepForm({...depForm,Purpose:e.target.value})} /></div>
            <div className="col-6"><input className="form-control" placeholder="Location" value={depForm.Location} onChange={e=>setDepForm({...depForm,Location:e.target.value})} /></div>
            <div className="col-12"><button className="btn btn-success" type="submit">Deposit</button></div>
          </form>
        </div>
      )}

      {tab === 'withdraw' && (
        <div className="card p-3" style={{maxWidth:480}}>
          <h5>💳 Withdrawal</h5>
          <form onSubmit={doWithdraw} className="row g-2">
            <div className="col-6"><input className="form-control" placeholder="Account ID" type="number" value={withForm.AccountID} onChange={e=>setWithForm({...withForm,AccountID:e.target.value})} required /></div>
            <div className="col-6"><input className="form-control" placeholder="Amount" type="number" step="0.01" value={withForm.Amount} onChange={e=>setWithForm({...withForm,Amount:e.target.value})} required /></div>
            <div className="col-6"><input className="form-control" placeholder="Purpose" value={withForm.Purpose} onChange={e=>setWithForm({...withForm,Purpose:e.target.value})} /></div>
            <div className="col-6"><input className="form-control" placeholder="Location" value={withForm.Location} onChange={e=>setWithForm({...withForm,Location:e.target.value})} /></div>
            <div className="col-12"><button className="btn btn-danger" type="submit">Withdraw</button></div>
          </form>
        </div>
      )}

      {tab === 'transfer' && (
        <div className="card p-3" style={{maxWidth:540}}>
          <h5>🔄 Transfer</h5>
          <form onSubmit={doTransfer} className="row g-2">
            <div className="col-6"><input className="form-control" placeholder="From Account ID" type="number" value={transForm.FromAccountID} onChange={e=>setTransForm({...transForm,FromAccountID:e.target.value})} required /></div>
            <div className="col-6"><input className="form-control" placeholder="To Account ID" type="number" value={transForm.ToAccountID} onChange={e=>setTransForm({...transForm,ToAccountID:e.target.value})} required /></div>
            <div className="col-4"><input className="form-control" placeholder="Amount" type="number" step="0.01" value={transForm.Amount} onChange={e=>setTransForm({...transForm,Amount:e.target.value})} required /></div>
            <div className="col-4"><input className="form-control" placeholder="Purpose" value={transForm.Purpose} onChange={e=>setTransForm({...transForm,Purpose:e.target.value})} /></div>
            <div className="col-4"><input className="form-control" placeholder="Location" value={transForm.Location} onChange={e=>setTransForm({...transForm,Location:e.target.value})} /></div>
            <div className="col-12"><button className="btn btn-primary" type="submit">Transfer</button></div>
          </form>
        </div>
      )}
    </ManagerLayout>
  );
}

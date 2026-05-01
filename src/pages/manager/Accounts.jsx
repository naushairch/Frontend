import { useEffect, useState } from 'react';
import ManagerLayout from './ManagerLayout';
import apiClient from '../../api/axiosconfig';

// SQL CHECK constraints:
//   AccountOwnershipType IN ('Private','Joint')     <-- NOT 'Single'
//   AccountStatus        IN ('Active','Under Review','Frozen')  <-- NOT 'Closed'
// AccountTypeName is a FK → AccountTypes table; must exist in DB

const EMPTY = { CustomerID: '', AccountTypeName: '', AccountOwnershipType: 'Private', Balance: '', DateCreated: '', SupervisorID: '' };

export default function Accounts() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ AccountStatus: 'Active', RiskScore: '' });
  const [msg, setMsg] = useState('');
  const [view, setView] = useState('all');

  const load = async (v = 'all') => {
    setView(v);
    const endpoints = {
      all: '/accounts',
      multiple: '/accounts/views/customers-multiple',
      joint: '/accounts/views/customers-joint',
      active: '/accounts/views/active-with-profile',
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
      await apiClient.post('/accounts', form);
      setMsg('Account created!'); setForm(EMPTY); load();
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const handleUpdate = async (id) => {
    try {
      await apiClient.put(`/accounts/${id}`, editForm);
      setMsg('Account updated!'); setEditId(null); load();
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account?')) return;
    try {
      await apiClient.delete(`/accounts/${id}`);
      setMsg('Deleted!'); load();
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const runAction = async (endpoint, label) => {
    try {
      const r = await apiClient.post(endpoint);
      setMsg(r.data.message || label + ' done!'); load();
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  return (
    <ManagerLayout>
      <h3>🏦 Accounts</h3>
      {msg && <div className="alert alert-info py-1">{msg}</div>}

      {/* Stored procedure action buttons */}
      <div className="mb-3 d-flex gap-2 flex-wrap">
        <button className="btn btn-danger btn-sm" onClick={() => runAction('/accounts/actions/freeze-high-risk', 'Freeze High-Risk')}>🔒 Freeze High-Risk</button>
        <button className="btn btn-warning btn-sm" onClick={() => runAction('/accounts/actions/increase-risk-score', 'Increase Risk Scores')}>📈 Update Risk Scores</button>
        <button className="btn btn-dark btn-sm" onClick={() => runAction('/accounts/actions/freeze-multiple-frauds', 'Freeze Multi-Fraud')}>🚨 Freeze Multi-Fraud Accounts</button>
      </div>

      {/* View tabs */}
      <ul className="nav nav-tabs mb-3">
        {[['all','All'],['multiple','Multiple Accounts (>2)'],['joint','Joint Accounts'],['active','Active w/ Profile']].map(([k,l]) => (
          <li className="nav-item" key={k}>
            <button className={`nav-link ${view===k?'active':''}`} onClick={() => load(k)}>{l}</button>
          </li>
        ))}
      </ul>

      {/* Create Form — only in 'all' view */}
      {view === 'all' && (
        <div className="card mb-4 p-3">
          <h5>➕ Create Account</h5>
          <p className="text-muted small mb-2">
            ⚠️ <strong>Account Type Name</strong> must exactly match a record in your <code>AccountTypes</code> table (it is a foreign key).
          </p>
          <form onSubmit={handleCreate} className="row g-2">
            <div className="col-md-4">
              <input className="form-control" placeholder="Customer ID" type="number"
                value={form.CustomerID} onChange={e => setForm({ ...form, CustomerID: e.target.value })} required />
            </div>
            <div className="col-md-4">
              {/* FK to AccountTypes — free text; value must exist in DB */}
              <input className="form-control" placeholder="Account Type Name (must exist in DB)"
                value={form.AccountTypeName} onChange={e => setForm({ ...form, AccountTypeName: e.target.value })} required />
            </div>
            <div className="col-md-4">
              {/* CHECK: AccountOwnershipType IN ('Private','Joint') */}
              <select className="form-select" value={form.AccountOwnershipType}
                onChange={e => setForm({ ...form, AccountOwnershipType: e.target.value, JointHolderID: '' })}>
                <option value="Private">Private</option>
                <option value="Joint">Joint</option>
              </select>
            </div>
            {form.AccountOwnershipType === 'Joint' && (
              <div className="col-md-4">
                <input className="form-control" placeholder="Joint Customer ID" type="number"
                  value={form.JointHolderID || ''} onChange={e => setForm({ ...form, JointHolderID: e.target.value })} required />
              </div>
            )}
            <div className="col-md-4">
              <input className="form-control" placeholder="Initial Balance" type="number" step="0.01"
                value={form.Balance} onChange={e => setForm({ ...form, Balance: e.target.value })} />
            </div>
            <div className="col-md-4">
              <input className="form-control" type="date" value={form.DateCreated}
                onChange={e => setForm({ ...form, DateCreated: e.target.value })} required />
            </div>
            <div className="col-md-4">
              <input className="form-control" placeholder="Supervisor Employee ID" type="number"
                value={form.SupervisorID} onChange={e => setForm({ ...form, SupervisorID: e.target.value })} required />
            </div>
            <div className="col-12">
              <button className="btn btn-primary" type="submit">Create</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-bordered table-hover table-sm">
          <thead className="table-dark">
            <tr>
              {view === 'all' && <><th>ID</th><th>Customer</th><th>Type</th><th>Ownership</th>
              <th>Balance</th><th>Status</th><th>Risk</th><th>Actions</th></>}
              {view === 'multiple' && <><th>Customer ID</th><th>Total Accounts</th></>}
              {view === 'joint' && <><th>Account ID</th><th>Primary Owner</th><th>Joint Holder</th><th>Type</th><th>Balance</th><th>Status</th></>}
              {view === 'active' && <><th>Account ID</th></>}
            </tr>
          </thead>
          <tbody>
            {list.map((a, i) => (
              <>
                {view === 'all' && (
                  <tr key={a.AccountID}>
                    <td>{a.AccountID}</td>
                    <td>{a.FirstName} {a.LastName}</td>
                    <td>{a.AccountTypeName}</td>
                    <td>{a.AccountOwnershipType}</td>
                    <td>${Number(a.Balance || 0).toLocaleString()}</td>
                    <td>
                      <span className={`badge bg-${a.AccountStatus === 'Active' ? 'success' : a.AccountStatus === 'Frozen' ? 'primary' : 'warning text-dark'}`}>
                        {a.AccountStatus}
                      </span>
                    </td>
                    <td>{a.RiskScore}</td>
                    <td>
                      <button className="btn btn-sm btn-warning me-1"
                        onClick={() => { setEditId(a.AccountID); setEditForm({ AccountStatus: a.AccountStatus || 'Active', RiskScore: a.RiskScore || '' }); }}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.AccountID)}>Delete</button>
                    </td>
                  </tr>
                )}
                {view === 'all' && editId === a.AccountID && (
                  <tr key={`edit-${a.AccountID}`} className="table-warning">
                    <td colSpan={8}>
                      <div className="d-flex gap-2 align-items-center p-1">
                        <select className="form-select form-select-sm" style={{ width: 160 }}
                          value={editForm.AccountStatus}
                          onChange={e => setEditForm({ ...editForm, AccountStatus: e.target.value })}>
                          <option value="Active">Active</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Frozen">Frozen</option>
                        </select>
                        <input className="form-control form-control-sm" style={{ width: 120 }}
                          placeholder="Risk Score" type="number"
                          value={editForm.RiskScore}
                          onChange={e => setEditForm({ ...editForm, RiskScore: e.target.value })} />
                        <button className="btn btn-sm btn-success" onClick={() => handleUpdate(a.AccountID)}>Save</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                )}
                {view === 'multiple' && (
                  <tr key={i}>
                    <td>{a.CustomerID}</td>
                    <td>{a.TotalAccounts}</td>
                  </tr>
                )}
                {view === 'joint' && (
                  <tr key={i}>
                    <td>{a.AccountID}</td>
                    <td>{a.FirstName} {a.LastName}</td>
                    <td>{a.JointFirstName} {a.JointLastName}</td>
                    <td>{a.AccountTypeName}</td>
                    <td>${Number(a.Balance || 0).toLocaleString()}</td>
                    <td>
                      <span className={`badge bg-${a.AccountStatus === 'Active' ? 'success' : a.AccountStatus === 'Frozen' ? 'primary' : 'warning text-dark'}`}>
                        {a.AccountStatus}
                      </span>
                    </td>
                  </tr>
                )}
                {view === 'active' && (
                  <tr key={i}>
                    <td>{a.AccountID}</td>
                  </tr>
                )}
              </>
            ))}
            {list.length === 0 && <tr><td colSpan={8} className="text-center text-muted">No records</td></tr>}
          </tbody>
        </table>
      </div>
    </ManagerLayout>
  );
}

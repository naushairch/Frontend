import { useEffect, useState } from 'react';
import ManagerLayout from './ManagerLayout';
import apiClient from '../../api/axiosconfig';

// SQL CHECK constraint:
//   FraudLogs.Status IN ('Pending Review','Approved','Blocked','Cleared')

export default function FraudLogs() {
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState('');
  const [view, setView] = useState('all');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ Status: 'Pending Review', ReviewedBy: '' });

  const load = async (v = 'all') => {
    setView(v);
    const endpoints = {
      all: '/fraud',
      pending: '/fraud/views/pending',
      audit: '/fraud/views/audit-dashboard',
      bytype: '/fraud/views/by-account-type',
    };
    try {
      const r = await apiClient.get(endpoints[v]);
      setList(r.data);
    } catch { setMsg('Failed to load'); }
  };

  useEffect(() => { load(); }, []);

  const handleReview = async (id) => {
    try {
      await apiClient.put(`/fraud/${id}`, editForm);
      setMsg('Fraud log updated!'); setEditId(null); load(view);
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const statusBadge = (s) => {
    const map = {
      'Pending Review': 'warning text-dark',
      'Approved': 'success',
      'Blocked': 'danger',
      'Cleared': 'secondary',
    };
    return <span className={`badge bg-${map[s] || 'secondary'}`}>{s}</span>;
  };

  return (
    <ManagerLayout>
      <h3>🚨 Fraud Logs</h3>
      {msg && <div className="alert alert-info py-1">{msg}</div>}

      <ul className="nav nav-tabs mb-3">
        {[['all','All'],['pending','Pending'],['audit','Audit Dashboard'],['bytype','By Account Type']].map(([k,l]) => (
          <li className="nav-item" key={k}>
            <button className={`nav-link ${view===k?'active':''}`} onClick={() => load(k)}>{l}</button>
          </li>
        ))}
      </ul>

      <div className="table-responsive">
        <table className="table table-sm table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              {(view === 'all' || view === 'pending') && <>
                <th>Fraud ID</th><th>Transaction</th><th>Account</th><th>Status</th><th>Detected</th><th>Reviewed By</th><th>Action</th>
              </>}
              {view === 'audit' && <>
                <th>Fraud ID</th><th>Account</th><th>Customer</th><th>Amount</th><th>Txn Type</th><th>Flagged</th><th>Status</th><th>Detected</th><th>Action</th>
              </>}
              {view === 'bytype' && <>
                <th>Account Type</th><th>Total Frauds</th>
              </>}
            </tr>
          </thead>
          <tbody>
            {list.map((row, i) => (
              <>
                <tr key={row.FraudID ?? i}>
                  {(view === 'all' || view === 'pending') && <>
                    <td>{row.FraudID}</td>
                    <td>{row.TransactionID}</td>
                    <td>{row.AccountID}</td>
                    <td>{statusBadge(row.Status)}</td>
                    <td>{row.DetectedOn ? new Date(row.DetectedOn).toLocaleDateString() : ''}</td>
                    <td>{row.ReviewedBy || '—'}</td>
                    <td>
                      <button className="btn btn-sm btn-warning"
                        onClick={() => { setEditId(row.FraudID); setEditForm({ Status: row.Status || 'Pending Review', ReviewedBy: row.ReviewedBy || '' }); }}>
                        Review
                      </button>
                    </td>
                  </>}
                  {view === 'audit' && <>
                    <td>{row.FraudID}</td>
                    <td>{row.AccountID}</td>
                    <td>{row.CustomerID}</td>
                    <td>${Number(row.Amount || 0).toLocaleString()}</td>
                    <td>{row.TransactionTypeName}</td>
                    <td>{row.IsFlagged ? '✅' : '—'}</td>
                    <td>{statusBadge(row.FraudStatus)}</td>
                    <td>{row.DetectedOn ? new Date(row.DetectedOn).toLocaleDateString() : ''}</td>
                    <td>
                      <button className="btn btn-sm btn-warning"
                        onClick={() => { setEditId(row.FraudID); setEditForm({ Status: row.FraudStatus || 'Pending Review', ReviewedBy: row.ReviewedBy || '' }); }}>
                        Review
                      </button>
                    </td>
                  </>}
                  {view === 'bytype' && <>
                    <td>{row.AccountTypeName}</td>
                    <td>{row.TotalFrauds}</td>
                  </>}
                </tr>
                {editId === row.FraudID && (
                  <tr key={`edit-${row.FraudID}`} className="table-warning">
                    <td colSpan={9}>
                      <div className="d-flex gap-2 align-items-center p-1">
                        {/* CHECK: Status IN ('Pending Review','Approved','Blocked','Cleared') */}
                        <select className="form-select form-select-sm" style={{ width: 170 }}
                          value={editForm.Status}
                          onChange={e => setEditForm({ ...editForm, Status: e.target.value })}>
                          <option value="Pending Review">Pending Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Blocked">Blocked</option>
                          <option value="Cleared">Cleared</option>
                        </select>
                        <input className="form-control form-control-sm" style={{ width: 160 }}
                          placeholder="Reviewed By (Employee ID)" type="number"
                          value={editForm.ReviewedBy}
                          onChange={e => setEditForm({ ...editForm, ReviewedBy: e.target.value })} />
                        <button className="btn btn-sm btn-success" onClick={() => handleReview(row.FraudID)}>Save</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {list.length === 0 && <tr><td colSpan={9} className="text-center text-muted">No records</td></tr>}
          </tbody>
        </table>
      </div>
    </ManagerLayout>
  );
}

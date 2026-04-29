import { useEffect, useState } from 'react';
import ManagerLayout from './ManagerLayout';
import apiClient from '../../api/axiosconfig';

export default function Approvals() {
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState('');
  const [view, setView] = useState('all');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ Status: 'Approved', ApprovedBy: '' });

  const load = async (v = 'all') => {
    setView(v);
    const endpoints = {
      all: '/approvals',
      pending: '/approvals/status/pending',
    };
    try {
      const r = await apiClient.get(endpoints[v]);
      setList(r.data);
    } catch { setMsg('Failed to load'); }
  };

  useEffect(() => { load(); }, []);

  const handleDecision = async (id) => {
    try {
      await apiClient.put(`/approvals/${id}`, editForm);
      setMsg(`Approval ${editForm.Status.toLowerCase()}!`); setEditId(null); load(view);
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const statusBadge = (s) => {
    const map = { Pending: 'warning', Approved: 'success', Rejected: 'danger' };
    return <span className={`badge bg-${map[s] || 'secondary'}`}>{s}</span>;
  };

  return (
    <ManagerLayout>
      <h3>✅ Transaction Approvals</h3>
      {msg && <div className="alert alert-info py-1">{msg}</div>}

      <ul className="nav nav-tabs mb-3">
        {[['all','All'],['pending','Pending Only']].map(([k,l]) => (
          <li className="nav-item" key={k}>
            <button className={`nav-link ${view===k?'active':''}`} onClick={() => load(k)}>{l}</button>
          </li>
        ))}
      </ul>

      <div className="table-responsive">
        <table className="table table-sm table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Approval ID</th><th>Transaction ID</th><th>Amount</th><th>Txn Type</th><th>Account</th><th>Status</th><th>Requested On</th><th>Approved By</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map(row => (
              <>
                <tr key={row.ApprovalID}>
                  <td>{row.ApprovalID}</td>
                  <td>{row.TransactionID}</td>
                  <td>${Number(row.Amount||0).toLocaleString()}</td>
                  <td>{row.TransactionTypeName}</td>
                  <td>{row.AccountID}</td>
                  <td>{statusBadge(row.Status)}</td>
                  <td>{row.RequestedOn ? new Date(row.RequestedOn).toLocaleDateString() : ''}</td>
                  <td>{row.ApprovedBy || '—'}</td>
                  <td>
                    {row.Status === 'Pending' && (
                      <button className="btn btn-sm btn-primary" onClick={() => { setEditId(row.ApprovalID); setEditForm({ Status: 'Approved', ApprovedBy: '' }); }}>
                        Decide
                      </button>
                    )}
                  </td>
                </tr>
                {editId === row.ApprovalID && (
                  <tr key={`edit-${row.ApprovalID}`} className="table-info">
                    <td colSpan={9}>
                      <div className="d-flex gap-2 align-items-center p-1">
                        <select className="form-select form-select-sm" style={{width:140}} value={editForm.Status} onChange={e=>setEditForm({...editForm,Status:e.target.value})}>
                          <option>Approved</option><option>Rejected</option><option>Pending</option>
                        </select>
                        <input className="form-control form-control-sm" style={{width:160}} placeholder="Manager Employee ID" type="number"
                          value={editForm.ApprovedBy} onChange={e=>setEditForm({...editForm,ApprovedBy:e.target.value})} required />
                        <button className="btn btn-sm btn-success" onClick={() => handleDecision(row.ApprovalID)}>Confirm</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {list.length === 0 && <tr><td colSpan={9} className="text-center text-muted">No approvals found</td></tr>}
          </tbody>
        </table>
      </div>
    </ManagerLayout>
  );
}

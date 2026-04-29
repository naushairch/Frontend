import { useEffect, useState } from 'react';
import ManagerLayout from './ManagerLayout';
import apiClient from '../../api/axiosconfig';

// SQL CHECK constraints:
//   CustomerType   IN ('Individual','Corporate','Government')  <-- NOT 'Business'
//   CustomerStatus IN ('Active','Blacklisted')                 <-- NOT 'Inactive'

const EMPTY = {
  FirstName: '', LastName: '', DOB: '', Address: '', Phone: '',
  Email: '', CustomerType: 'Individual', CreditScore: '', CustomerStatus: 'Active'
};

export default function Customers() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const r = await apiClient.get('/customers');
      setList(r.data);
    } catch { setMsg('Failed to load'); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await apiClient.put(`/customers/${editId}`, form);
        setMsg('Customer updated!');
      } else {
        await apiClient.post('/customers', form);
        setMsg('Customer registered!');
      }
      setForm(EMPTY); setEditId(null); load();
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await apiClient.delete(`/customers/${id}`);
      setMsg('Deleted!'); load();
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const handleEdit = (c) => {
    setForm({
      FirstName: c.FirstName, LastName: c.LastName,
      DOB: c.DOB?.split('T')[0] || '', Address: c.Address || '',
      Phone: c.Phone, Email: c.Email,
      CustomerType: c.CustomerType, CreditScore: c.CreditScore || '',
      CustomerStatus: c.CustomerStatus
    });
    setEditId(c.CustomerID);
  };

  const removeBlacklisted = async () => {
    try {
      await apiClient.post('/customers/actions/remove-blacklisted');
      setMsg('Blacklisted customers removed!'); load();
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  return (
    <ManagerLayout>
      <h3>🧑 Customers</h3>
      {msg && <div className="alert alert-info py-1">{msg}</div>}

      <button className="btn btn-danger btn-sm mb-3" onClick={removeBlacklisted}>
        🗑 Remove All Blacklisted (sp_RemoveBlacklistedCustomers)
      </button>

      {/* Add / Edit Form */}
      <div className="card mb-4 p-3">
        <h5>{editId ? '✏️ Edit Customer' : '➕ Register Customer'}</h5>
        <form onSubmit={handleSubmit} className="row g-2">
          <div className="col-md-4">
            <input className="form-control" placeholder="First Name" value={form.FirstName}
              onChange={e => setForm({ ...form, FirstName: e.target.value })} required />
          </div>
          <div className="col-md-4">
            <input className="form-control" placeholder="Last Name" value={form.LastName}
              onChange={e => setForm({ ...form, LastName: e.target.value })} required />
          </div>
          <div className="col-md-4">
            <input className="form-control" type="date" placeholder="Date of Birth" value={form.DOB}
              onChange={e => setForm({ ...form, DOB: e.target.value })} required />
          </div>
          <div className="col-md-4">
            <input className="form-control" placeholder="Phone" value={form.Phone}
              onChange={e => setForm({ ...form, Phone: e.target.value })} />
          </div>
          <div className="col-md-4">
            <input className="form-control" placeholder="Email" type="email" value={form.Email}
              onChange={e => setForm({ ...form, Email: e.target.value })} />
          </div>
          <div className="col-md-4">
            <input className="form-control" placeholder="Address" value={form.Address}
              onChange={e => setForm({ ...form, Address: e.target.value })} />
          </div>
          <div className="col-md-4">
            <input className="form-control" placeholder="Credit Score" type="number" value={form.CreditScore}
              onChange={e => setForm({ ...form, CreditScore: e.target.value })} />
          </div>
          <div className="col-md-4">
            {/* CHECK: CustomerType IN ('Individual','Corporate','Government') */}
            <select className="form-select" value={form.CustomerType}
              onChange={e => setForm({ ...form, CustomerType: e.target.value })}>
              <option value="Individual">Individual</option>
              <option value="Corporate">Corporate</option>
              <option value="Government">Government</option>
            </select>
          </div>
          <div className="col-md-4">
            {/* CHECK: CustomerStatus IN ('Active','Blacklisted') */}
            <select className="form-select" value={form.CustomerStatus}
              onChange={e => setForm({ ...form, CustomerStatus: e.target.value })}>
              <option value="Active">Active</option>
              <option value="Blacklisted">Blacklisted</option>
            </select>
          </div>
          <div className="col-12">
            <button className="btn btn-primary me-2" type="submit">{editId ? 'Update' : 'Register'}</button>
            {editId && (
              <button className="btn btn-secondary" type="button"
                onClick={() => { setForm(EMPTY); setEditId(null); }}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover table-sm">
          <thead className="table-dark">
            <tr>
              <th>ID</th><th>Name</th><th>Type</th><th>Email</th><th>Phone</th><th>Credit</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(c => (
              <tr key={c.CustomerID}>
                <td>{c.CustomerID}</td>
                <td>{c.FirstName} {c.LastName}</td>
                <td>{c.CustomerType}</td>
                <td>{c.Email}</td>
                <td>{c.Phone}</td>
                <td>{c.CreditScore}</td>
                <td>
                  <span className={`badge bg-${c.CustomerStatus === 'Active' ? 'success' : 'danger'}`}>
                    {c.CustomerStatus}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(c)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.CustomerID)}>Delete</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={8} className="text-center text-muted">No records</td></tr>}
          </tbody>
        </table>
      </div>
    </ManagerLayout>
  );
}

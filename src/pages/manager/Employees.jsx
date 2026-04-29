import { useEffect, useState } from 'react';
import ManagerLayout from './ManagerLayout';
import apiClient from '../../api/axiosconfig';

const EMPTY = { FirstName: '', LastName: '', RoleName: '', Phone: '', Email: '' };

export default function Employees() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  const load = async () => {
    try {
      const r = await apiClient.get('/employees');
      setList(r.data);
    } catch { setMsg('Failed to load employees'); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await apiClient.put(`/employees/${editId}`, form);
        setMsg('Employee updated!');
      } else {
        await apiClient.post('/employees', form);
        setMsg('Employee added!');
      }
      setForm(EMPTY); setEditId(null); load();
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    try {
      await apiClient.delete(`/employees/${id}`);
      setMsg('Deleted!'); load();
    } catch (err) { setMsg(err.response?.data?.message || 'Delete failed'); }
  };

  const handleEdit = (emp) => {
    setForm({ FirstName: emp.FirstName, LastName: emp.LastName, RoleName: emp.RoleName, Phone: emp.Phone, Email: emp.Email });
    setEditId(emp.EmployeeID);
  };

  const handleSearch = async () => {
    if (!searchEmail.trim()) return load();
    try {
      const r = await apiClient.get(`/employees/search/by-email?email=${searchEmail}`);
      setList(r.data);
    } catch { setMsg('Search failed'); }
  };

  return (
    <ManagerLayout>
      <h3>👥 Employees</h3>
      {msg && <div className="alert alert-info py-1">{msg}</div>}

      {/* Search */}
      <div className="input-group mb-3" style={{ maxWidth: 400 }}>
        <input className="form-control" placeholder="Search by email domain..." value={searchEmail}
          onChange={e => setSearchEmail(e.target.value)} />
        <button className="btn btn-outline-secondary" onClick={handleSearch}>Search</button>
        <button className="btn btn-outline-danger" onClick={() => { setSearchEmail(''); load(); }}>Clear</button>
      </div>

      {/* Add / Edit Form */}
      <div className="card mb-4 p-3">
        <h5>{editId ? '✏️ Edit Employee' : '➕ Add Employee'}</h5>
        <form onSubmit={handleSubmit} className="row g-2">
          {['FirstName','LastName','RoleName','Phone','Email'].map(field => (
            <div className="col-md-4" key={field}>
              <input className="form-control" placeholder={field} value={form[field]}
                onChange={e => setForm({ ...form, [field]: e.target.value })} required={['FirstName','LastName'].includes(field)} />
            </div>
          ))}
          <div className="col-12">
            <button className="btn btn-primary me-2" type="submit">{editId ? 'Update' : 'Add'}</button>
            {editId && <button className="btn btn-secondary" type="button" onClick={() => { setForm(EMPTY); setEditId(null); }}>Cancel</button>}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover table-sm">
          <thead className="table-dark">
            <tr>
              <th>ID</th><th>Name</th><th>Role</th><th>Phone</th><th>Email</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(emp => (
              <tr key={emp.EmployeeID}>
                <td>{emp.EmployeeID}</td>
                <td>{emp.FirstName} {emp.LastName}</td>
                <td>{emp.RoleName}</td>
                <td>{emp.Phone}</td>
                <td>{emp.Email}</td>
                <td>
                  <button className="btn btn-sm btn-warning me-1" onClick={() => handleEdit(emp)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(emp.EmployeeID)}>Delete</button>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={6} className="text-center text-muted">No records</td></tr>}
          </tbody>
        </table>
      </div>
    </ManagerLayout>
  );
}

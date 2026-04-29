import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosconfig';

export default function CustomerLogin() {
  const [customerId, setCustomerId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!customerId) return;
    setLoading(true);
    setError('');
    try {
      // Verify the customer exists
      const r = await apiClient.get(`/customers/${customerId}`);
      // Store in localStorage so all customer pages can read it
      localStorage.setItem('customerId', customerId);
      localStorage.setItem('customerName', `${r.data.FirstName} ${r.data.LastName}`);
      localStorage.setItem('customerStatus', r.data.CustomerStatus);
      navigate('/customer/home');
    } catch (err) {
      setError(err.response?.status === 404 ? 'Customer not found. Check your ID.' : 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center vh-100">
      <div className="card p-4 shadow" style={{ maxWidth: 400, width: '100%' }}>
        <h3 className="text-center mb-1">🏦 SmartBank</h3>
        <p className="text-center text-muted mb-4">Customer Portal</p>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Enter your Customer ID</label>
            <input
              id="input-customer-id"
              className="form-control form-control-lg"
              type="number"
              placeholder="e.g. 1"
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              required
            />
            <div className="form-text">Your Customer ID is assigned when you're registered.</div>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <button className="btn btn-primary w-100" type="submit" disabled={loading}>
            {loading ? 'Checking...' : 'Enter →'}
          </button>
        </form>

        <hr />
        <div className="text-center">
          <button className="btn btn-link btn-sm text-secondary" onClick={() => navigate('/')}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

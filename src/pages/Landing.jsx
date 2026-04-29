import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center vh-100">
      <h1 className="mb-2 fw-bold">🏦 SmartBank</h1>
      <p className="text-muted mb-5">Welcome! Please select who you are.</p>
      <div className="d-flex gap-4">
        <button
          id="btn-customer"
          className="btn btn-primary btn-lg px-5"
          onClick={() => navigate('/customer')}
        >
          👤 Customer
        </button>
        <button
          id="btn-manager"
          className="btn btn-dark btn-lg px-5"
          onClick={() => navigate('/manager')}
        >
          🔑 Manager
        </button>
      </div>
    </div>
  );
}

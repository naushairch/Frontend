import { useEffect, useState } from 'react';
import ManagerLayout from './ManagerLayout';
import apiClient from '../../api/axiosconfig';

export default function ManagerHome() {
  const [stats, setStats] = useState({
    employees: null,
    customers: null,
    accounts: null,
    fraudPending: null,
    approvalsPending: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [emp, cust, acc, fraud, appr] = await Promise.allSettled([
          apiClient.get('/employees'),
          apiClient.get('/customers'),
          apiClient.get('/accounts'),
          apiClient.get('/fraud/views/pending'),
          apiClient.get('/approvals/status/pending'),
        ]);
        setStats({
          employees: emp.status === 'fulfilled' ? emp.value.data.length : '—',
          customers: cust.status === 'fulfilled' ? cust.value.data.length : '—',
          accounts: acc.status === 'fulfilled' ? acc.value.data.length : '—',
          fraudPending: fraud.status === 'fulfilled' ? fraud.value.data.length : '—',
          approvalsPending: appr.status === 'fulfilled' ? appr.value.data.length : '—',
        });
      } catch {
        // individual failures handled via allSettled
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Employees', value: stats.employees, color: 'primary', icon: '👥' },
    { label: 'Customers', value: stats.customers, color: 'success', icon: '🧑' },
    { label: 'Accounts', value: stats.accounts, color: 'info', icon: '🏦' },
    { label: 'Pending Fraud', value: stats.fraudPending, color: 'danger', icon: '🚨' },
    { label: 'Pending Approvals', value: stats.approvalsPending, color: 'warning', icon: '✅' },
  ];

  return (
    <ManagerLayout>
      <h2 className="mb-1">Welcome, Manager! 👋</h2>
      <p className="text-muted mb-4">Here's a quick overview of the system.</p>

      <div className="row g-3">
        {cards.map((c) => (
          <div className="col-sm-6 col-md-4 col-lg-3" key={c.label}>
            <div className={`card border-${c.color} text-center p-3`}>
              <div style={{ fontSize: '2rem' }}>{c.icon}</div>
              <h3 className={`text-${c.color} fw-bold`}>{c.value ?? '…'}</h3>
              <p className="mb-0 text-muted small">{c.label}</p>
            </div>
          </div>
        ))}
      </div>
    </ManagerLayout>
  );
}

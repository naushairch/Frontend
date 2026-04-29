import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';

// Manager pages
import ManagerHome from './pages/manager/ManagerHome';
import Employees from './pages/manager/Employees';
import Customers from './pages/manager/Customers';
import Accounts from './pages/manager/Accounts';
import Transactions from './pages/manager/Transactions';
import Loans from './pages/manager/Loans';
import FraudLogs from './pages/manager/FraudLogs';
import Approvals from './pages/manager/Approvals';

// Customer pages
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerHome from './pages/customer/CustomerHome';
import CustomerAccounts from './pages/customer/CustomerAccounts';
import CustomerTransactions from './pages/customer/CustomerTransactions';
import CustomerLoans from './pages/customer/CustomerLoans';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* Manager */}
        <Route path="/manager" element={<ManagerHome />} />
        <Route path="/manager/employees" element={<Employees />} />
        <Route path="/manager/customers" element={<Customers />} />
        <Route path="/manager/accounts" element={<Accounts />} />
        <Route path="/manager/transactions" element={<Transactions />} />
        <Route path="/manager/loans" element={<Loans />} />
        <Route path="/manager/fraud" element={<FraudLogs />} />
        <Route path="/manager/approvals" element={<Approvals />} />

        {/* Customer */}
        <Route path="/customer" element={<CustomerLogin />} />
        <Route path="/customer/home" element={<CustomerHome />} />
        <Route path="/customer/accounts" element={<CustomerAccounts />} />
        <Route path="/customer/transactions" element={<CustomerTransactions />} />
        <Route path="/customer/loans" element={<CustomerLoans />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import TenantDashboard from './pages/TenantDashboard';
import SuperAdmin from './pages/SuperAdmin';
import DashboardLayout from './components/DashboardLayout';

export const API_URL = "https://script.google.com/macros/s/AKfycbx-7pqD3Ucn1H9jD2f4IulYwEvG7a5qfa9hYh8dmPxAvPjLGnb-7xBUZYpqof2uBw1h/exec";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Route Dashboard (Terlindungi oleh Layout) */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<TenantDashboard />} />
        </Route>

        {/* Route Super Admin Khusus Anda */}
        <Route path="/nabil-super-admin" element={<SuperAdmin />} />
      </Routes>
    </Router>
  );
}
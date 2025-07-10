import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHeartbeat, FaUserMd, FaCalendarCheck, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DoctorList from './pages/DoctorList';
import MyAppointments from './pages/MyAppointments';
import MedicalInfo from './pages/MedicalInfo';
import DoctorDashboard from './pages/DoctorDashboard';
import Chat from './pages/Chat';
import { useParams } from 'react-router-dom';

function RequireAuth({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function RequireAdmin({ children }) {
  // Remove admin route protection
  return null;
}

function getUserRole() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch {
    return null;
  }
}

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = getUserRole();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow rounded-4 mb-4 py-2 px-3 animate-fade-in" style={{ fontFamily: 'InterVariable, Inter, sans-serif', fontWeight: 500, background: 'linear-gradient(90deg, #f8fafc 0%, #e0e7ef 100%)', border: '1px solid #e5e7eb' }}>
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center gap-2 text-primary fw-bold fs-3" to="/dashboard" style={{ letterSpacing: 1 }}>
          <FaHeartbeat className="text-danger" size={28} /> Smart OPD
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="mainNav">
          <ul className="navbar-nav align-items-center gap-2">
            {token && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link d-flex align-items-center gap-1 px-3 rounded-3${location.pathname === '/doctors' ? ' active-nav' : ''}`} to="/doctors" style={{ transition: 'background 0.2s' }}>
                    <FaUserMd /> Doctors
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link d-flex align-items-center gap-1 px-3 rounded-3${location.pathname === '/my-appointments' ? ' active-nav' : ''}`} to="/my-appointments" style={{ transition: 'background 0.2s' }}>
                    <FaCalendarCheck /> My Appointments
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link d-flex align-items-center gap-1 px-3 rounded-3${location.pathname === '/dashboard' ? ' active-nav' : ''}`} to="/dashboard" style={{ transition: 'background 0.2s' }}>
                    <FaUserCircle /> Dashboard
                  </Link>
                </li>
                {token && role === 'doctor' && (
                  <li className="nav-item">
                    <Link className={`nav-link d-flex align-items-center gap-1 px-3 rounded-3${location.pathname === '/doctor/dashboard' ? ' active-nav' : ''}`} to="/doctor/dashboard" style={{ transition: 'background 0.2s' }}>
                      <FaUserMd /> Doctor Dashboard
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 px-3 rounded-3" onClick={handleLogout} style={{ fontWeight: 600 }}>
                    <FaSignOutAlt /> Logout
                  </button>
                </li>
              </>
            )}
            {!token && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link d-flex align-items-center gap-1 px-3 rounded-3${location.pathname === '/login' ? ' active-nav' : ''}`} to="/login" style={{ transition: 'background 0.2s' }}>
                    <FaSignInAlt /> Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link d-flex align-items-center gap-1 px-3 rounded-3${location.pathname === '/signup' ? ' active-nav' : ''}`} to="/signup" style={{ transition: 'background 0.2s' }}>
                    <FaUserPlus /> Signup
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
      <style>{`
        .nav-link.active-nav, .nav-link:hover {
          background: #e0e7ef !important;
          color: #0d6efd !important;
        }
        .navbar-nav .nav-link {
          font-size: 1.08rem;
        }
      `}</style>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/doctors" element={<RequireAuth><DoctorList /></RequireAuth>} />
        <Route path="/my-appointments" element={<RequireAuth><MyAppointments /></RequireAuth>} />
        <Route path="/medical-info" element={<RequireAuth><MedicalInfo /></RequireAuth>} />
        <Route path="/doctor/dashboard" element={<RequireAuth><DoctorDashboard /></RequireAuth>} />
        <Route path="/chat/:userId" element={<RequireAuth><ChatWrapper /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

function ChatWrapper() {
  const { userId } = useParams();
  // Optionally, fetch user name by userId for display
  return <Chat otherUserId={userId} />;
}

export default App; 
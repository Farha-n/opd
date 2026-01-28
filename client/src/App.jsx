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
import SymptomChecker from './pages/SymptomChecker';
import CalendarPage from './pages/Calendar';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

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

function Navbar({ darkMode, setDarkMode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = getUserRole();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow rounded-4 mb-4 py-2 px-3 animate-fade-in" style={{ fontFamily: 'InterVariable, Inter, sans-serif', fontWeight: 500, background: darkMode ? 'linear-gradient(90deg, #23272f 0%, #2d3748 100%)' : 'linear-gradient(90deg, #f8fafc 0%, #e0e7ef 100%)', border: darkMode ? '1px solid #23272f' : '1px solid #e5e7eb' }}>
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
                  <Link className={`nav-link d-flex align-items-center gap-1 px-3 rounded-3${location.pathname === '/calendar' ? ' active-nav' : ''}`} to="/calendar" style={{ transition: 'background 0.2s' }}>
                    <FaCalendarCheck /> Calendar
                  </Link>
                </li>
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
                <li className="nav-item">
                  <Link className={`nav-link d-flex align-items-center gap-1 px-3 rounded-3${location.pathname === '/symptom-checker' ? ' active-nav' : ''}`} to="/symptom-checker" style={{ transition: 'background 0.2s' }}>
                    <FaHeartbeat /> Symptom Checker
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
                <li className="nav-item">
                  <Link className={`nav-link d-flex align-items-center gap-1 px-3 rounded-3${location.pathname === '/symptom-checker' ? ' active-nav' : ''}`} to="/symptom-checker" style={{ transition: 'background 0.2s' }}>
                    <FaHeartbeat /> Symptom Checker
                  </Link>
                </li>
            </>
          )}
          </ul>
        </div>
        <div className="d-flex align-items-center gap-3 ms-3">
          <button
            className={`btn btn-${darkMode ? 'light' : 'dark'} btn-sm rounded-circle`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            onClick={() => setDarkMode((d) => !d)}
            style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {darkMode ? (
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm4.22 2.22a1 1 0 0 1 1.42 1.42l-.7.7a1 1 0 1 1-1.42-1.42l.7-.7zM18 9a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2h1zM4.28 4.22a1 1 0 0 1 1.42 0l.7.7A1 1 0 0 1 5 6.34l-.7-.7a1 1 0 0 1 0-1.42zM3 10a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2H3zm1.28 5.78a1 1 0 0 1 0-1.42l.7-.7a1 1 0 1 1 1.42 1.42l-.7.7a1 1 0 0 1-1.42 0zM10 16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zm5.72-1.78a1 1 0 0 1 0 1.42l-.7.7a1 1 0 1 1-1.42-1.42l.7-.7a1 1 0 0 1 1.42 0zM10 6a4 4 0 1 1 0 8a4 4 0 0 1 0-8z"/></svg>
            ) : (
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 0 1 6.707 2.707a8.001 8.001 0 1 0 10.586 10.586z"/></svg>
            )}
          </button>
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
  // Dark mode state and effect
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      const root = document.getElementById('root');
      if (root) root.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
      const root = document.getElementById('root');
      if (root) root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <Router>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/doctors" element={<RequireAuth><DoctorList /></RequireAuth>} />
        <Route path="/my-appointments" element={<RequireAuth><MyAppointments /></RequireAuth>} />
        <Route path="/medical-info" element={<RequireAuth><MedicalInfo /></RequireAuth>} />
        <Route path="/doctor/dashboard" element={<RequireAuth><DoctorDashboard /></RequireAuth>} />
        <Route path="/chat/:userId" element={<RequireAuth><ChatWrapper /></RequireAuth>} />
        <Route path="/symptom-checker" element={<SymptomChecker />} />
        <Route path="/calendar" element={<RequireAuth><CalendarPage /></RequireAuth>} />
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
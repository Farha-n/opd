import React, { useState } from 'react';

const backgroundUrl = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd07?auto=format&fit=crop&w=1500&q=80'; // Example health/medical image

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('user');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `url(${backgroundUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 1s',
    }}>
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="bg-white bg-opacity-95 p-5 rounded-4 shadow-lg w-100 animate-fade-in" style={{ maxWidth: 400 }}>
          <div className="d-flex flex-column align-items-center mb-3">
            <div className="rounded-circle bg-success bg-opacity-10 mb-2" style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 36, color: '#198754' }}>📝</span>
            </div>
            <h2 className="text-3xl fw-bold mb-2 text-center text-success">Sign Up</h2>
            <div className="text-muted mb-2">Create your account to get started.</div>
          </div>
          {error && <div className="alert alert-danger mb-3 p-2 animate-shake" role="alert">{error}</div>}
          <form onSubmit={handleSubmit} autoComplete="on">
            <div className="form-floating mb-3">
              <input type="text" className="form-control" id="signupName" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required autoFocus autoComplete="name" />
              <label htmlFor="signupName">Name</label>
            </div>
            <div className="form-floating mb-3">
              <input type="email" className="form-control" id="signupEmail" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" />
              <label htmlFor="signupEmail">Email address</label>
            </div>
            <div className="form-floating mb-4 position-relative">
              <input type={showPassword ? 'text' : 'password'} className="form-control" id="signupPassword" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
              <label htmlFor="signupPassword">Password</label>
              <button type="button" className="position-absolute top-50 end-0 translate-middle-y me-3 btn btn-link p-0" style={{fontSize:'1.2rem'}} onClick={()=>setShowPassword(v=>!v)} tabIndex={-1} aria-label="Toggle password visibility">
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <div className="form-floating mb-4">
              <select className="form-select" id="signupRole" value={role} onChange={e => setRole(e.target.value)} required>
                <option value="user">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
              <label htmlFor="signupRole">Sign up as</label>
            </div>
            <button type="submit" className="btn btn-success w-100 transition-all duration-200 mb-2 py-2 fs-5 shadow-sm" disabled={loading} style={{boxShadow: loading ? '0 0 10px #198754' : ''}}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
          <div className="mt-3 text-center">
            <span className="text-muted">Already have an account?</span> <a href="/login" className="text-success fw-bold hover:underline">Login</a>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Signup; 
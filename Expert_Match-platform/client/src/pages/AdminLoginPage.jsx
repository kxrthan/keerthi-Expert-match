import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/httpClient.js';
import '../styles/admin.css';
import '../styles/landing.css';

function AdminLoginPage() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-theme' : 'dark-theme';
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch(
        '/api/admin/login',
        {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
        },
        'Login failed'
      );

      localStorage.setItem('adminEmail', data.email);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="landing-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="landing-header">
        <div className="landing-logo" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>ExpertMatch</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              padding: '0.5rem',
              transition: 'transform 0.3s ease'
            }}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <button type="button" className="landing-btn-login" onClick={() => window.location.href = '/'}>
            Back to Home
          </button>
        </div>
      </header>

      <div className="admin-login-shell">
        <div className="login-card">
          <div className="login-header">
            <h1>🛡️ Admin Portal</h1>
            <p>Expert Match Administration</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && <div className="error-box">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@expertmatch.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="primary-btn login-btn"
              disabled={loading}
            >
              {loading ? '⏳ Logging in...' : '🔓 Access Admin Dashboard'}
            </button>
          </form>

          <div className="login-footer">
            <p>Restricted access for administrators only</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;

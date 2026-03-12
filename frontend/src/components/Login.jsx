import React, { useState } from 'react';
import { apiFetch } from '../apiClient.js';

function Login({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
      } else {
        onSuccess(data.user);
      }
    } catch (err) {
      setError('Unable to reach server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="left-content">
          <div className="left-hindi">॥ जय माँ विन्ध्यवासिनी ॥</div>
          <img src="/Logo.png" alt="SVR" className="left-logo" />
          <div className="left-brand">Shree Vishwanath Roadways</div>
          <div className="left-tagline">SERVICE THROUGH COMMITMENT</div>
        </div>
      </div>
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="form-header">
            <h1>Welcome back</h1>
            <p>Use your admin credentials to continue.</p>
          </div>

          {error && (
            <div className="error-message show">
              <span className="error-icon">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="new-username"
              required
            />

            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="new-password"
              required
            />

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

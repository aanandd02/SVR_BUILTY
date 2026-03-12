import React, { useEffect, useState } from 'react';
import Login from './components/Login.jsx';
import BuiltyForm from './components/BuiltyForm.jsx';
import { apiFetch } from './apiClient.js';

async function fetchCurrentUser() {
  try {
    const res = await apiFetch('/auth/me');
    if (res.ok) {
      const data = await res.json();
      return data.user || null;
    }
  } catch (err) {
    console.error('Unable to load user', err);
  }
  return null;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout failed', err);
    }
    setUser(null);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-box">
          <img src="/Logo.png" alt="SVR" className="loading-logo" />
          <div className="spinner" />
          <div className="loading-text">Loading session...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onSuccess={setUser} />;
  }

  return <BuiltyForm user={user} onLogout={handleLogout} onAuthFail={() => setUser(null)} />;
}

export default App;

import React, { useEffect, useState } from 'react';
import Login from './components/Login.jsx';
import BuiltyForm from './components/BuiltyForm.jsx';
import { apiFetch } from './apiClient.js';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function BootScreen({ message }) {
  return (
    <div className="boot-screen">
      <div className="boot-card">
        <div className="boot-dot" />
        <h2>Server is booting</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bootMessage, setBootMessage] = useState('Checking session...');

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      let attempt = 0;
      while (active) {
        attempt += 1;
        try {
          const res = await apiFetch('/auth/me');
          if (res.ok) {
            const data = await res.json();
            if (!active) return;
            setUser(data.user || null);
            setLoading(false);
            return;
          }
          if (res.status === 401) {
            if (!active) return;
            setLoading(false);
            return;
          }
        } catch (err) {
          // likely backend cold start
        }
        setBootMessage('Server is booting... we will take you to login as soon as it is ready.');
        await delay(Math.min(1500 + attempt * 200, 4000));
      }
    };

    bootstrap();
    return () => {
      active = false;
    };
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
    return <BootScreen message={bootMessage} />;
  }

  if (!user) {
    return <Login onSuccess={setUser} />;
  }

  return <BuiltyForm user={user} onLogout={handleLogout} onAuthFail={() => setUser(null)} />;
}

export default App;

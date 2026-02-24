require('dotenv').config();

const ADMIN = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123',
  name: process.env.ADMIN_NAME || 'Administrator',
};

function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Please enter both username and password.' });
  }

  if (username !== ADMIN.username || password !== ADMIN.password) {
    return res.status(401).json({ error: 'Invalid username or password. Please try again.' });
  }

  req.session.user = { username: ADMIN.username, name: ADMIN.name };
  return res.json({ success: true, user: { username: ADMIN.username, name: ADMIN.name } });
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to sign out. Please try again.' });
    }
    res.clearCookie('svr.sid');
    return res.json({ success: true });
  });
}

function getMe(req, res) {
  if (req.session && req.session.user) {
    return res.json({ user: req.session.user });
  }
  return res.status(401).json({ error: 'Session expired. Please sign in again.' });
}

module.exports = { login, logout, getMe };

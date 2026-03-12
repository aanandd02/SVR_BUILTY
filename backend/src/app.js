require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const pdfRoutes = require('./routes/pdf.routes');
const authRoutes = require('./routes/auth.routes');
const { requireAuth } = require('./middleware/auth.middleware');

const app = express();

const CLIENT_ORIGINS = (process.env.CLIENT_URLS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const isProd = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);

app.use(cors({ origin: CLIENT_ORIGINS, credentials: true }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'svr-builty-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  name: 'svr.sid',
  rolling: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd
  }
}));

app.use('/auth', authRoutes);
app.use('/api', requireAuth, pdfRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const connectDB  = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://127.0.0.1:5500',
    'http://localhost:3000',
    'https://internsaathi.netlify.app',
    'https://internsaathi.com',
    'https://www.internsaathi.com'
  ],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files (from the parent directory where HTML files are)
app.use(express.static(path.join(__dirname, '..')));

// Default to index (2).html for the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index (2).html'));
});

// Serve about-us without .html extension
app.get('/about-us', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'about-us.html'));
});

// ── API Routes ───────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/internships',   require('./routes/internships'));
app.use('/api/applications',  require('./routes/applications'));
app.use('/api/users',         require('./routes/users'));

// ── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🚀 InternSaathi API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ── Keep-Awake Ping ──────────────────────────────────────
app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

// ── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global Error Handler ─────────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 InternSaathi API Server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;

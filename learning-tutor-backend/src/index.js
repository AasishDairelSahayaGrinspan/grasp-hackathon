/**
 * Learning-First AI Coding Tutor - Backend Server
 *
 * This is the ONLY AI brain for the entire system.
 * Both the web frontend and VS Code extension call this backend.
 *
 * STRICT RULE: This server NEVER generates complete code solutions.
 * It only provides explanations, hints, and analogies.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const analyzeRoutes = require('./routes/analyze');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================
// MIDDLEWARE SETUP
// ============================================================

// Enable CORS for frontend and VS Code extension
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'vscode-webview://*'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Parse JSON request bodies
app.use(express.json());

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================
// ROUTES
// ============================================================

// Health check endpoint - useful for testing if server is running
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Learning Tutor Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Main analyze endpoint - the AI brain lives here
app.use('/analyze', analyzeRoutes);

// ============================================================
// ERROR HANDLING
// ============================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    hint: 'Try POST /analyze with code, language, level, and hintLevel'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Something went wrong on our end',
    hint: 'Check the server logs for more details'
  });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║     🎓 Learning-First AI Coding Tutor - Backend Server       ║
╠══════════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}                    ║
║  Health check:      http://localhost:${PORT}/health             ║
║  Analyze endpoint:  POST http://localhost:${PORT}/analyze       ║
╠══════════════════════════════════════════════════════════════╣
║  Remember: We NEVER give complete code solutions!            ║
║  We help students LEARN by thinking, not copying.            ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;

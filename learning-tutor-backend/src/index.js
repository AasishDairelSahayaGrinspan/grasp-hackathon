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
const runRoutes = require('./routes/run');
const analyzeImageRoutes = require('./routes/analyzeImage');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================
// MIDDLEWARE SETUP
// ============================================================

// Enable CORS for frontend and VS Code extension
app.use(cors({
  origin: (origin, callback) => {
    // Allow all origins for now to debug connection issues
    callback(null, true);
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../frontend')));

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

// API landing page - shows available endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    service: "Learning-First AI Coding Tutor API",
    status: "running",
    endpoints: {
      health: "GET /health",
      analyze: "POST /analyze",
      run: "POST /run",
      "analyze-image": "POST /analyze-image"
    },
    note: "Use POST endpoints with JSON body"
  });
});

// Main analyze endpoint - the AI brain lives here
app.use('/analyze', analyzeRoutes);

// Code execution endpoint - run code safely
app.use('/run', runRoutes);

// Image analysis endpoint - problem screenshots
app.use('/analyze-image', analyzeImageRoutes);

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

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

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║     🎓 Learning-First AI Coding Tutor - Backend Server       ║
╠══════════════════════════════════════════════════════════════╣
║  Server running on: http://0.0.0.0:${PORT}                    ║
║  Health check:      http://0.0.0.0:${PORT}/health             ║
║  Analyze endpoint:  POST http://0.0.0.0:${PORT}/analyze       ║
║  Run code:          POST http://0.0.0.0:${PORT}/run           ║
╠══════════════════════════════════════════════════════════════╣
║  Remember: We NEVER give complete code solutions!            ║
║  We help students LEARN by thinking, not copying.            ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;

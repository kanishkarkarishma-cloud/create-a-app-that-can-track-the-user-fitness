const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const { get } = require('./src/db/database');
const { seedDatabase } = require('./src/db/seed');

// Route modules
const authRoutes = require('./src/routes/authRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const occupationRoutes = require('./src/routes/occupationRoutes');
const userRoutes = require('./src/routes/userRoutes');
const enrollmentRoutes = require('./src/routes/enrollmentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const docsRoutes = require('./src/routes/docsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'public')));

// Mount API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/occupations', occupationRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1', enrollmentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api', docsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    ministry: 'Ministry of Statistics and Programme Implementation (MoSPI)',
    platform: 'MoSPI AI Learning & Course Management System',
    timestamp: new Date().toISOString()
  });
});

// Single Page Application Fallback: Route all non-API requests to public/index.html
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: { code: 'ENDPOINT_NOT_FOUND', message: `API endpoint '${req.path}' not found.` }
    });
  }
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.'
    }
  });
});

// Auto-seed check and server start
async function startServer() {
  try {
    const userCount = get('SELECT count(*) as count FROM users')?.count || 0;
    if (userCount === 0) {
      console.log('⚡ Initializing database with seed data...');
      await seedDatabase();
    }

    app.listen(PORT, () => {
      console.log('================================================================');
      console.log('🏛  MoSPI AI Learning & Course Management Platform (Live)');
      console.log(`🌐 Web Portal URL:       http://localhost:${PORT}`);
      console.log(`📖 API Documentation:    http://localhost:${PORT}/api/docs`);
      console.log(`📊 OpenAPI JSON Spec:    http://localhost:${PORT}/api/v1/openapi.json`);
      console.log('================================================================');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();

module.exports = app;

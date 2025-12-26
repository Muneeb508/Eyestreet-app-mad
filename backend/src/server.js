const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const connectDb = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const issueRoutes = require('./routes/issues');
const communityRoutes = require('./routes/community');
const healthRoutes = require('./routes/health');

const app = express();

// Middleware
app.use(cors({ origin: '*'}));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

// Request logging middleware (after body parsing)
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    const bodyCopy = { ...req.body };
    if (bodyCopy.password) bodyCopy.password = '***';
    console.log('Request body:', bodyCopy);
  }
  next();
});

// Connect to MongoDB (non-blocking)
connectDb().catch(err => {
  console.error('Failed to connect to MongoDB on startup:', err.message);
  console.log('Server will continue running, but database operations may fail');
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/community', communityRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Street Eye backend running on port ${PORT}`);
  console.log(`Server accessible at http://localhost:${PORT}`);
  console.log(`Android emulator can access at http://10.0.2.2:${PORT}`);
});



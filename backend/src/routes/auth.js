const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = '7d';

// Test endpoint (no database required)
router.get('/test', (req, res) => {
  res.json({ message: 'Auth endpoint is working!', timestamp: new Date().toISOString() });
});

const createToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Helper function to add timeout to promises
const withTimeout = (promise, timeoutMs, errorMessage) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
};

// Signup
router.post('/signup', async (req, res) => {
  console.log('[AUTH] ========== SIGNUP REQUEST RECEIVED ==========');
  console.log('[AUTH] Timestamp:', new Date().toISOString());
  const startTime = Date.now();
  
  // Set response timeout (shorter for faster feedback)
  res.setTimeout(8000, () => {
    if (!res.headersSent) {
      console.error('[AUTH] Response timeout after 8s - sending error');
      res.status(504).json({ message: 'Request timeout' });
    }
  });

  try {
    // Check MongoDB connection
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    console.log('[AUTH] MongoDB connection state:', dbState, '(1=connected, 0=disconnected, 2=connecting, 3=disconnecting)');
    
    if (dbState !== 1) {
      console.log('[AUTH] Database not connected, attempting quick connect...');
      try {
        const localUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/streeteye';
        await withTimeout(
          mongoose.connect(localUri, {
            serverSelectionTimeoutMS: 2000,
            socketTimeoutMS: 3000,
          }),
          2000,
          'MongoDB connection timeout'
        );
        console.log('[AUTH] MongoDB connected successfully');
      } catch (connectErr) {
        console.error('[AUTH] MongoDB connection failed:', connectErr.message);
        return res.status(503).json({ message: 'Database not available. Please try again later.' });
      }
    } else {
      console.log('[AUTH] MongoDB already connected');
    }

    const { name, email, password, city } = req.body;
    console.log('[AUTH] Signup request received:', { name, email, city: city || 'not provided' });
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    console.log('[AUTH] Checking for existing user...');
    const existing = await withTimeout(
      User.findOne({ email }).maxTimeMS(2000),
      2000,
      'Database query timeout'
    );
    
    if (existing) {
      console.log('[AUTH] Email already exists');
      return res.status(400).json({ message: 'Email already in use' });
    }

    console.log('[AUTH] Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('[AUTH] Creating user in database...');
    const user = await withTimeout(
      User.create({
        name,
        email,
        passwordHash,
        city,
      }),
      3000,
      'User creation timeout'
    );

    console.log('[AUTH] User created:', user._id);
    const token = createToken(user);

    const duration = Date.now() - startTime;
    console.log(`[AUTH] Signup completed in ${duration}ms`);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        city: user.city,
      },
      token,
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`[AUTH] Signup error after ${duration}ms:`, err.message || err);
    
    if (!res.headersSent) {
      if (err.message && err.message.includes('timeout')) {
        return res.status(504).json({ message: 'Request timeout. Please try again.' });
      }
      if (err.name === 'MongoServerSelectionError' || err.name === 'MongoTimeoutError' || err.name === 'MongoNetworkError') {
        return res.status(503).json({ message: 'Database connection error. Please try again later.' });
      }
      res.status(500).json({ message: err.message || 'Server error' });
    }
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        city: user.city,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



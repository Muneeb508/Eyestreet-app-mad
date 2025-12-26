const express = require('express');
const User = require('../models/User');

const router = express.Router();

// NOTE: This is a minimal user API. You can later add proper auth/JWT.

// Create or update user profile (e.g., from mobile app after signup)
router.post('/', async (req, res) => {
  try {
    const { email, name, city } = req.body;
    if (!email || !name) {
      return res.status(400).json({ message: 'name and email are required' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, name, city });
    } else {
      user.name = name;
      user.city = city;
    }

    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user by email (simple example)
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



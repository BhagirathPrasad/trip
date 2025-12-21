const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ message: 'Missing fields' });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, name, passwordHash });

  const token = jwt.sign({ sub: user._id }, process.env.SECRET_KEY || 'secret', { expiresIn: '7d' });
  res.json({ access_token: token, token_type: 'bearer', user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing email or password' });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Incorrect email or password' });

  if (!user.passwordHash) {
    console.warn(`User ${email} missing passwordHash`);
    // Helpful developer message for the admin account only (non-production)
    if (user.email === 'admin@tripplanner.com' && process.env.NODE_ENV !== 'production') {
      return res.status(400).json({ message: 'Admin exists but has no password. POST /api/auth/reset-admin-password with { "password": "<new>" } to set it.' });
    }

    return res.status(401).json({ message: 'Incorrect email or password' });
  }

  let ok = false;
  try {
    ok = await bcrypt.compare(password, user.passwordHash);
  } catch (err) {
    console.error('bcrypt.compare error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }

  if (!ok) return res.status(401).json({ message: 'Incorrect email or password' });

  const token = jwt.sign({ sub: user._id }, process.env.SECRET_KEY || 'secret', { expiresIn: '7d' });
  res.json({ access_token: token, token_type: 'bearer', user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});

// Me
const { auth } = require('../middleware/auth');
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

// DEV: Reset default admin password (only in non-production)
router.post('/reset-admin-password', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ message: 'Not allowed in production' });
  const { password } = req.body;
  if (!password) return res.status(400).json({ message: 'Missing password' });

  const adminEmail = 'admin@tripplanner.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    // Create default admin in non-production environments
    admin = await User.create({
      email: adminEmail,
      name: 'Admin',
      role: 'admin',
      passwordHash: await bcrypt.hash(password, 10)
    });

    return res.json({ message: 'Admin created and password set' });
  }

  admin.passwordHash = await bcrypt.hash(password, 10);
  await admin.save();

  res.json({ message: 'Admin password reset' });
});

module.exports = router;
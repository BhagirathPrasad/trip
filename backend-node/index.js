require('dotenv').config();
require('express-async-errors');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./src/routes/auth');
const tripsRoutes = require('./src/routes/trips');
const bookingsRoutes = require('./src/routes/bookings');
const contactRoutes = require('./src/routes/contact');
const dashboardRoutes = require('./src/routes/dashboard');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*' }));

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 8000;

async function start() {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
  try {
    await mongoose.connect(mongoUrl, { dbName: process.env.DB_NAME || 'test_database' });
    console.log('Connected to MongoDB');

    // Ensure default admin exists
    const User = require('./src/models/User');
    const adminEmail = 'admin@tripplanner.com';
    const admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      await User.create({
        email: adminEmail,
        name: 'Admin User',
        role: 'admin',
        passwordHash: await require('bcrypt').hash('admin123', 10),
      });
      console.log('Default admin user created: admin@tripplanner.com / admin123');
    } else if (!admin.passwordHash && process.env.NODE_ENV !== 'production') {
      // If an admin document exists but has no passwordHash (likely from older data), set a default
      admin.passwordHash = await require('bcrypt').hash('admin123', 10);
      await admin.save();
      console.log('Admin was missing passwordHash — set default password to admin123 (dev only)');
    }

    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
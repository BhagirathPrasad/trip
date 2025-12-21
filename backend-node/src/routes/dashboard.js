const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/stats', auth, adminOnly, async (req, res) => {
  const total_trips = await Trip.countDocuments({});
  const total_bookings = await Booking.countDocuments({});
  const pending_bookings = await Booking.countDocuments({ status: 'pending' });
  const total_contacts = await Contact.countDocuments({});
  res.json({ total_trips, total_bookings, pending_bookings, total_contacts });
});

module.exports = router;
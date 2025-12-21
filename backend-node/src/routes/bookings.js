const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const { auth, adminOnly } = require('../middleware/auth');

// Create booking
router.post('/', auth, async (req, res) => {
  const { trip_id, travel_date, travelers } = req.body;
  const trip = await Trip.findById(trip_id);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });

  const booking = await Booking.create({
    user_id: req.user._id,
    user_email: req.user.email,
    trip_id: trip._id,
    trip_title: trip.title,
    travel_date,
    travelers,
  });

  res.json(booking);
});

// Get my bookings
router.get('/my', auth, async (req, res) => {
  const bookings = await Booking.find({ user_id: req.user._id }).select('-__v');
  res.json(bookings);
});

// Admin get all
router.get('/', auth, adminOnly, async (req, res) => {
  const bookings = await Booking.find({}).select('-__v');
  res.json(bookings);
});

// Update status (admin)
router.patch('/:id/status', auth, adminOnly, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  booking.status = req.body.status;
  await booking.save();
  res.json(booking);
});

module.exports = router;
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const { auth, adminOnly } = require('../middleware/auth');

// Create trip (admin)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const trip = await Trip.create(req.body);
    res.json(trip);
  } catch (err) {
    console.error('Create trip error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all trips
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find({}).select('-__v');
    res.json(trips);
  } catch (err) {
    console.error('Get trips error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid trip id' });

    const trip = await Trip.findById(id).select('-__v');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    console.error('Get trip by id error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update (admin)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid trip id' });

    const trip = await Trip.findByIdAndUpdate(id, req.body, { new: true });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    console.error('Update trip error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete (admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid trip id' });

    const resu = await Trip.findByIdAndDelete(id);
    if (!resu) return res.status(404).json({ message: 'Trip not found' });
    res.json({ message: 'Trip deleted successfully' });
  } catch (err) {
    console.error('Delete trip error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
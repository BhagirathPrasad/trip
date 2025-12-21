const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { auth, adminOnly } = require('../middleware/auth');

router.post('/', async (req, res) => {
  const contact = await Contact.create(req.body);
  res.json(contact);
});

router.get('/', auth, adminOnly, async (req, res) => {
  const contacts = await Contact.find({}).select('-__v');
  res.json(contacts);
});

// Get my contact messages (authenticated users)
router.get('/my', auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ email: req.user.email }).select('-__v');
    res.json(contacts);
  } catch (err) {
    console.error('Get my contacts error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/:id/reply', auth, adminOnly, async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) return res.status(404).json({ message: 'Contact message not found' });
  contact.reply = req.body.reply;
  contact.status = 'replied';
  await contact.save();
  res.json(contact);
});

module.exports = router;
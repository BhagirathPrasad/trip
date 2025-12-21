const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  reply: { type: String },
  status: { type: String, default: 'pending' },
  created_at: { type: Date, default: () => new Date() }
});

module.exports = mongoose.model('Contact', ContactSchema);
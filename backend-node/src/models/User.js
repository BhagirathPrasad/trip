const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, default: 'user' },
  passwordHash: { type: String, required: true },
  created_at: { type: Date, default: () => new Date() }
});

module.exports = mongoose.model('User', UserSchema);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TripSchema = new Schema({
  title: { type: String, required: true },
  destination: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String },
  created_at: { type: Date, default: () => new Date() }
});

module.exports = mongoose.model('Trip', TripSchema);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  user_email: { type: String, required: true },
  trip_id: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
  trip_title: { type: String, required: true },
  travel_date: { type: String, required: true },
  travelers: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  created_at: { type: Date, default: () => new Date() }
});

module.exports = mongoose.model('Booking', BookingSchema);
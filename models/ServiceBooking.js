const mongoose = require('mongoose');

const ServiceBookingSchema = new mongoose.Schema({
  bookingNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceType: { type: String, required: true },
  price: String,
  duration: String,
  description: String,
  address: {
    street: String,
    city: String,
    pincode: String
  },
  preferredDate: Date,
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

ServiceBookingSchema.pre('save', function(next) {
  if (!this.bookingNumber) {
    this.bookingNumber = 'SRV-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('ServiceBooking', ServiceBookingSchema);

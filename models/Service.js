const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  duration: { type: String, required: true },
  icon: { type: String, default: '🔧' },
  color: { type: String, default: '#FF6B6B' },
  category: { type: String, enum: ['refill', 'amc', 'inspection', 'testing'], required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Service', ServiceSchema);

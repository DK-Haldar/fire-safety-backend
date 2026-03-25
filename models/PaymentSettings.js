const mongoose = require('mongoose');

const PaymentSettingsSchema = new mongoose.Schema({
  razorpay: {
    enabled: { type: Boolean, default: false },
    keyId: { type: String, default: '' },
    keySecret: { type: String, default: '' },
    webhookSecret: { type: String, default: '' },
    testMode: { type: Boolean, default: true }
  },
  cashfree: {
    enabled: { type: Boolean, default: false },
    appId: { type: String, default: '' },
    secretKey: { type: String, default: '' },
    apiUrl: { type: String, default: 'https://api.cashfree.com/pg' },
    testMode: { type: Boolean, default: true }
  },
  cod: { type: Boolean, default: true },
  upi: { type: Boolean, default: true },
  card: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('PaymentSettings', PaymentSettingsSchema);

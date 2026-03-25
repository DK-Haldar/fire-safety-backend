module.exports = {
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 'your_key_secret',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret'
  },
  cashfree: {
    appId: process.env.CASHFREE_APP_ID || 'your_app_id',
    secretKey: process.env.CASHFREE_SECRET_KEY || 'your_secret_key',
    apiUrl: process.env.CASHFREE_API_URL || 'https://api.cashfree.com/pg',
    returnUrl: process.env.CASHFREE_RETURN_URL || 'http://localhost:5000/api/payments/cashfree/verify'
  }
};

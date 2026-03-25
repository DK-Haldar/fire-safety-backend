const express = require('express');
const PaymentSettings = require('../models/PaymentSettings');
const auth = require('../middleware/auth');
const axios = require('axios');
const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get payment settings
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = new PaymentSettings({
        razorpay: { enabled: false, keyId: '', keySecret: '', webhookSecret: '', testMode: true },
        cashfree: { enabled: false, appId: '', secretKey: '', apiUrl: 'https://api.cashfree.com/pg', testMode: true },
        cod: true,
        upi: true,
        card: true
      });
      await settings.save();
    }
    
    const safeSettings = {
      razorpay: {
        enabled: settings.razorpay.enabled,
        keyId: settings.razorpay.keyId,
        keySecret: settings.razorpay.keySecret ? '••••••••' : '',
        webhookSecret: settings.razorpay.webhookSecret ? '••••••••' : '',
        testMode: settings.razorpay.testMode
      },
      cashfree: {
        enabled: settings.cashfree.enabled,
        appId: settings.cashfree.appId,
        secretKey: settings.cashfree.secretKey ? '••••••••' : '',
        apiUrl: settings.cashfree.apiUrl,
        testMode: settings.cashfree.testMode
      },
      cod: settings.cod,
      upi: settings.upi,
      card: settings.card
    };
    
    res.json(safeSettings);
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update payment settings
router.put('/', auth, adminOnly, async (req, res) => {
  try {
    const { razorpay, cashfree, cod, upi, card } = req.body;
    
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = new PaymentSettings();
    }
    
    // Update Razorpay settings
    if (razorpay) {
      if (razorpay.enabled !== undefined) settings.razorpay.enabled = razorpay.enabled;
      if (razorpay.keyId !== undefined && razorpay.keyId !== '••••••••') settings.razorpay.keyId = razorpay.keyId;
      if (razorpay.keySecret !== undefined && razorpay.keySecret !== '••••••••') settings.razorpay.keySecret = razorpay.keySecret;
      if (razorpay.webhookSecret !== undefined && razorpay.webhookSecret !== '••••••••') settings.razorpay.webhookSecret = razorpay.webhookSecret;
      if (razorpay.testMode !== undefined) settings.razorpay.testMode = razorpay.testMode;
    }
    
    // Update Cashfree settings
    if (cashfree) {
      if (cashfree.enabled !== undefined) settings.cashfree.enabled = cashfree.enabled;
      if (cashfree.appId !== undefined && cashfree.appId !== '••••••••') settings.cashfree.appId = cashfree.appId;
      if (cashfree.secretKey !== undefined && cashfree.secretKey !== '••••••••') settings.cashfree.secretKey = cashfree.secretKey;
      if (cashfree.apiUrl !== undefined && cashfree.apiUrl !== '••••••••') settings.cashfree.apiUrl = cashfree.apiUrl;
      if (cashfree.testMode !== undefined) settings.cashfree.testMode = cashfree.testMode;
    }
    
    // Update payment methods
    if (cod !== undefined) settings.cod = cod;
    if (upi !== undefined) settings.upi = upi;
    if (card !== undefined) settings.card = card;
    
    settings.updatedAt = new Date();
    settings.updatedBy = req.user.id;
    
    await settings.save();
    
    const safeSettings = {
      razorpay: {
        enabled: settings.razorpay.enabled,
        keyId: settings.razorpay.keyId,
        keySecret: '••••••••',
        webhookSecret: '••••••••',
        testMode: settings.razorpay.testMode
      },
      cashfree: {
        enabled: settings.cashfree.enabled,
        appId: settings.cashfree.appId,
        secretKey: '••••••••',
        apiUrl: settings.cashfree.apiUrl,
        testMode: settings.cashfree.testMode
      },
      cod: settings.cod,
      upi: settings.upi,
      card: settings.card
    };
    
    res.json({ 
      success: true, 
      message: 'Payment settings updated successfully',
      settings: safeSettings
    });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    res.status(500).json({ message: 'Failed to save settings', error: error.message });
  }
});

// Test Cashfree connection
router.post('/test/cashfree', auth, adminOnly, async (req, res) => {
  try {
    const { appId, secretKey, apiUrl } = req.body;
    
    if (!appId || !secretKey) {
      return res.status(400).json({ success: false, message: 'Please provide App ID and Secret Key' });
    }
    
    const testApiUrl = apiUrl || 'https://api.cashfree.com/pg';
    
    // Generate a valid alphanumeric customer ID (no email, just letters/numbers)
    const validCustomerId = 'CUST_' + Date.now();
    
    const payload = {
      order_id: `TEST_${Date.now()}`,
      order_amount: 1,
      order_currency: 'INR',
      customer_details: {
        customer_id: validCustomerId,
        customer_name: 'Test User',
        customer_email: 'test@example.com',
        customer_phone: '9999999999'
      },
      order_meta: {
        return_url: 'https://example.com/return'
      }
    };
    
    const response = await axios.post(
      `${testApiUrl}/orders`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-version': '2022-09-01',
          'x-client-id': appId,
          'x-client-secret': secretKey
        },
        timeout: 10000
      }
    );
    
    res.json({ success: true, message: 'Cashfree connection successful', orderId: response.data.order_id });
  } catch (error) {
    console.error('Cashfree test error:', error.response?.data || error.message);
    
    let errorMessage = 'Connection failed';
    if (error.response?.status === 401 || error.response?.status === 403) {
      errorMessage = 'Authentication failed. Please check your App ID and Secret Key';
    } else if (error.response?.status === 404) {
      errorMessage = 'API endpoint not found. Please check your API URL';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Connection timeout. Please check your internet connection';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(400).json({ success: false, message: errorMessage });
  }
});

// Test Razorpay connection
router.post('/test/razorpay', auth, adminOnly, async (req, res) => {
  try {
    const { keyId, keySecret } = req.body;
    
    if (!keyId || !keySecret) {
      return res.status(400).json({ success: false, message: 'Please provide Key ID and Key Secret' });
    }
    
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    
    const order = await razorpay.orders.create({
      amount: 100,
      currency: 'INR',
      receipt: 'test_connection'
    });
    
    res.json({ success: true, message: 'Razorpay connection successful', orderId: order.id });
  } catch (error) {
    console.error('Razorpay test error:', error);
    res.status(400).json({ success: false, message: error.message || 'Connection failed' });
  }
});

module.exports = router;

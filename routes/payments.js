const express = require('express');
const PaymentService = require('../services/paymentService');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const router = express.Router();

// Create Cashfree order
router.post('/cashfree/create-order', auth, async (req, res) => {
  try {
    const { orderId, amount, customerName, customerEmail, customerPhone, returnUrl } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const result = await PaymentService.createCashfreeOrder({
      orderId: order.orderNumber,
      orderAmount: amount,
      customerName: customerName || order.user?.name,
      customerEmail: customerEmail || order.user?.email,
      customerPhone: customerPhone || order.user?.phone,
      returnUrl: returnUrl
    });
    
    if (result.success) {
      await Order.findByIdAndUpdate(orderId, {
        cashfreeOrderId: result.orderId,
        cashfreeSessionId: result.paymentSessionId
      });
      
      res.json({
        success: true,
        paymentSessionId: result.paymentSessionId,
        paymentLink: result.paymentLink,
        orderId: result.orderId
      });
    } else {
      res.status(400).json({ success: false, message: result.error, details: result.details });
    }
  } catch (error) {
    console.error('Cashfree order error:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

// Cashfree Webhook (For live payments)
router.post('/cashfree/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('Cashfree webhook received:', webhookData);
    
    const { order_id, payment_status, cf_payment_id, order_amount } = webhookData;
    
    if (payment_status === 'SUCCESS') {
      const order = await Order.findOne({ cashfreeOrderId: order_id });
      if (order && order.paymentStatus !== 'paid') {
        await Order.findByIdAndUpdate(order._id, {
          paymentStatus: 'paid',
          cashfreePaymentId: cf_payment_id,
          status: 'confirmed'
        });
        
        console.log(`Order ${order.orderNumber} payment confirmed via webhook`);
      }
    }
    
    // Always respond with 200 to acknowledge receipt
    res.json({ received: true });
  } catch (error) {
    console.error('Cashfree webhook error:', error);
    // Still return 200 to avoid retries
    res.json({ received: true, error: error.message });
  }
});

// Cashfree Return URL (User redirected after payment)
router.get('/cashfree/return', async (req, res) => {
  try {
    const { order_id, payment_status, payment_id } = req.query;
    
    console.log('Cashfree return:', { order_id, payment_status, payment_id });
    
    if (payment_status === 'SUCCESS') {
      const order = await Order.findOne({ cashfreeOrderId: order_id });
      if (order && order.paymentStatus !== 'paid') {
        await Order.findByIdAndUpdate(order._id, {
          paymentStatus: 'paid',
          cashfreePaymentId: payment_id,
          status: 'confirmed'
        });
      }
      
      // Redirect to success page
      res.redirect(`${process.env.FRONTEND_URL}/payment-success?order=${order_id}`);
    } else {
      // Redirect to failure page
      res.redirect(`${process.env.FRONTEND_URL}/payment-failed?order=${order_id}`);
    }
  } catch (error) {
    console.error('Cashfree return error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
  }
});

// Get payment status
router.get('/status/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // If Cashfree payment and we have an order ID, check live status
    if (order.cashfreeOrderId && order.paymentStatus !== 'paid') {
      const status = await PaymentService.getCashfreePaymentStatus(order.cashfreeOrderId);
      if (status.success && status.paymentStatus === 'SUCCESS') {
        await Order.findByIdAndUpdate(order._id, {
          paymentStatus: 'paid',
          status: 'confirmed'
        });
        order.paymentStatus = 'paid';
      }
    }
    
    res.json({
      success: true,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      razorpayPaymentId: order.razorpayPaymentId,
      cashfreePaymentId: order.cashfreePaymentId
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ success: false, message: 'Failed to get status' });
  }
});

// Refund payment
router.post('/refund/:orderId', auth, async (req, res) => {
  try {
    const { refundAmount, refundNote } = req.body;
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({ success: false, message: 'Order not paid' });
    }
    
    let result;
    if (order.cashfreePaymentId) {
      result = await PaymentService.refundCashfreePayment(
        order.cashfreeOrderId,
        order.cashfreePaymentId,
        refundAmount,
        refundNote
      );
    } else {
      return res.status(400).json({ success: false, message: 'Refund not supported for this payment method' });
    }
    
    if (result.success) {
      await Order.findByIdAndUpdate(order._id, {
        status: 'cancelled',
        refundId: result.refundId
      });
      res.json({ success: true, refundId: result.refundId });
    } else {
      res.status(400).json({ success: false, message: result.error });
    }
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ success: false, message: 'Failed to process refund' });
  }
});

module.exports = router;

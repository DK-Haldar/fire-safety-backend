const Razorpay = require('razorpay');
const crypto = require('crypto');
const axios = require('axios');

class PaymentService {
  constructor() {
    // Initialize Razorpay only if enabled and credentials exist
    if (process.env.RAZORPAY_ENABLED === 'true' && process.env.RAZORPAY_KEY_ID) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
    }
  }

  // ==================== RAZORPAY METHODS ====================
  
  async createRazorpayOrder(amount, currency = 'INR', receipt) {
    if (!this.razorpay) {
      return { success: false, error: 'Razorpay is not configured' };
    }
    
    try {
      const options = {
        amount: amount * 100,
        currency: currency,
        receipt: receipt,
        payment_capture: 1
      };
      const order = await this.razorpay.orders.create(options);
      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      };
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      return { success: false, error: error.message };
    }
  }

  verifyRazorpayPayment(orderId, paymentId, signature) {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    return expectedSignature === signature;
  }

  // ==================== CASHFREE METHODS (LIVE) ====================

  async createCashfreeOrder(orderData) {
    try {
      const {
        orderId,
        orderAmount,
        orderCurrency = 'INR',
        customerName,
        customerEmail,
        customerPhone,
        returnUrl
      } = orderData;

      const apiUrl = process.env.CASHFREE_API_URL || 'https://api.cashfree.com/pg';
      
      // Generate a unique order ID with timestamp
      const uniqueOrderId = `ORDER_${Date.now()}_${orderId.replace(/[^a-zA-Z0-9]/g, '')}`;
      
      const payload = {
        order_id: uniqueOrderId.slice(0, 30), // Max 30 chars
        order_amount: orderAmount,
        order_currency: orderCurrency,
        customer_details: {
          customer_id: customerEmail.slice(0, 50),
          customer_name: customerName.slice(0, 100),
          customer_email: customerEmail.slice(0, 100),
          customer_phone: customerPhone.slice(0, 10)
        },
        order_meta: {
          return_url: returnUrl || `${process.env.BACKEND_URL}/api/payments/cashfree/return`,
          notify_url: `${process.env.BACKEND_URL}/api/payments/cashfree/webhook`
        },
        order_expiry_time: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      };

      console.log('Creating Cashfree order:', JSON.stringify(payload, null, 2));

      const response = await axios.post(
        `${apiUrl}/orders`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-version': '2022-09-01',
            'x-client-id': process.env.CASHFREE_APP_ID,
            'x-client-secret': process.env.CASHFREE_SECRET_KEY
          }
        }
      );

      console.log('Cashfree response:', response.data);

      return {
        success: true,
        paymentSessionId: response.data.payment_session_id,
        orderId: response.data.order_id,
        paymentLink: response.data.payment_link
      };
    } catch (error) {
      console.error('Cashfree order creation error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        details: error.response?.data
      };
    }
  }

  async verifyCashfreePayment(orderId) {
    try {
      const apiUrl = process.env.CASHFREE_API_URL || 'https://api.cashfree.com/pg';
      
      const response = await axios.get(
        `${apiUrl}/orders/${orderId}/payments`,
        {
          headers: {
            'x-api-version': '2022-09-01',
            'x-client-id': process.env.CASHFREE_APP_ID,
            'x-client-secret': process.env.CASHFREE_SECRET_KEY
          }
        }
      );

      const payments = response.data;
      const successfulPayment = payments.find(p => p.payment_status === 'SUCCESS');
      
      if (successfulPayment) {
        return {
          success: true,
          paymentId: successfulPayment.cf_payment_id,
          status: successfulPayment.payment_status,
          amount: successfulPayment.order_amount,
          paymentMethod: successfulPayment.payment_method
        };
      }
      
      return {
        success: false,
        status: payments[0]?.payment_status || 'pending',
        message: 'Payment not completed'
      };
    } catch (error) {
      console.error('Cashfree verification error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async getCashfreePaymentStatus(orderId) {
    try {
      const apiUrl = process.env.CASHFREE_API_URL || 'https://api.cashfree.com/pg';
      
      const response = await axios.get(
        `${apiUrl}/orders/${orderId}`,
        {
          headers: {
            'x-api-version': '2022-09-01',
            'x-client-id': process.env.CASHFREE_APP_ID,
            'x-client-secret': process.env.CASHFREE_SECRET_KEY
          }
        }
      );
      
      return {
        success: true,
        orderStatus: response.data.order_status,
        paymentStatus: response.data.payment_status
      };
    } catch (error) {
      console.error('Cashfree status error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }

  async refundCashfreePayment(orderId, paymentId, refundAmount, refundNote = '') {
    try {
      const apiUrl = process.env.CASHFREE_API_URL || 'https://api.cashfree.com/pg';
      
      const payload = {
        refund_amount: refundAmount,
        refund_note: refundNote || 'Customer refund',
        refund_id: `REFUND_${Date.now()}`
      };
      
      const response = await axios.post(
        `${apiUrl}/orders/${orderId}/payments/${paymentId}/refunds`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-version': '2022-09-01',
            'x-client-id': process.env.CASHFREE_APP_ID,
            'x-client-secret': process.env.CASHFREE_SECRET_KEY
          }
        }
      );
      
      return {
        success: true,
        refundId: response.data.refund_id,
        status: response.data.refund_status
      };
    } catch (error) {
      console.error('Cashfree refund error:', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  }
}

module.exports = new PaymentService();

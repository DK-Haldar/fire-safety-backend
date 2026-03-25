const nodemailer = require('nodemailer');

let transporter = null;

const initTransporter = () => {
  if (!transporter && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

const sendOrderConfirmation = async (order, user) => {
  try {
    const mailTransporter = initTransporter();
    if (!mailTransporter) {
      console.log('Email not configured, skipping...');
      return false;
    }

    const itemsList = order.items.map(item => 
      `<li>${item.name} x ${item.quantity} - ₹${item.price * item.quantity}</li>`
    ).join('');

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@firesafetypro.com',
      to: user.email,
      subject: `Order Confirmed - #${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #FF6B6B; padding: 20px; text-align: center;">
            <h1 style="color: #fff;">🔥 Fire Safety Pro</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Thank you for your order, ${user.name}!</h2>
            <p>Your order <strong>#${order.orderNumber}</strong> has been confirmed.</p>
            
            <h3>Order Details:</h3>
            <ul>${itemsList}</ul>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
              <p><strong>Subtotal:</strong> ₹${order.subtotal}</p>
              <p><strong>Delivery Fee:</strong> ₹${order.deliveryFee}</p>
              <p><strong>Total:</strong> ₹${order.total}</p>
            </div>
            
            <h3>Shipping Address:</h3>
            <p>
              ${order.address.street}<br/>
              ${order.address.city}, ${order.address.state}<br/>
              ${order.address.pincode}
            </p>
            
            <p>We'll deliver your order within 3-5 business days.</p>
            
            <p>Track your order: ${process.env.FRONTEND_URL}/track-order/${order._id}</p>
          </div>
        </div>
      `,
    };
    
    await mailTransporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

const sendServiceBookingConfirmation = async (booking, user) => {
  try {
    const mailTransporter = initTransporter();
    if (!mailTransporter) return false;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@firesafetypro.com',
      to: user.email,
      subject: `Service Booking Confirmed - #${booking.bookingNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #FF6B6B; padding: 20px; text-align: center;">
            <h1 style="color: #fff;">🔥 Fire Safety Pro</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Service Booking Confirmed!</h2>
            <p>Hi ${user.name},</p>
            <p>Your service booking <strong>#${booking.bookingNumber}</strong> has been confirmed.</p>
            
            <h3>Service Details:</h3>
            <p><strong>Service:</strong> ${booking.serviceType}</p>
            <p><strong>Price:</strong> ${booking.price}</p>
            <p><strong>Duration:</strong> ${booking.duration}</p>
            
            <p>We'll contact you within 24 hours to confirm the schedule.</p>
          </div>
        </div>
      `,
    };
    
    await mailTransporter.sendMail(mailOptions);
    console.log(`Service booking email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = { sendOrderConfirmation, sendServiceBookingConfirmation };

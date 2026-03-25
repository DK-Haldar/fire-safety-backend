const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Service = require('../models/Service');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalServices = await Service.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments();
    
    const revenue = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'shipped', 'confirmed'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name');
    
    res.json({
      success: true,
      data: {
        totalOrders,
        totalProducts,
        totalServices,
        totalUsers,
        totalRevenue: revenue[0]?.total || 0,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

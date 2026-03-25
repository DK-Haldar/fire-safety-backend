const express = require('express');
const router = express.Router();
const packageJson = require('../package.json');

router.get('/', (req, res) => {
  res.json({
    name: 'Fire Safety Pro API',
    version: packageJson.version,
    status: 'active',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        me: 'GET /api/auth/me',
      },
      products: {
        list: 'GET /api/products',
        single: 'GET /api/products/:id',
      },
      orders: {
        create: 'POST /api/orders',
        list: 'GET /api/orders/my-orders',
        single: 'GET /api/orders/:id',
      },
      services: {
        list: 'GET /api/services',
        book: 'POST /api/services',
        bookings: 'GET /api/services/my-bookings',
      },
      admin: {
        stats: 'GET /api/admin/stats',
        users: 'GET /api/admin/users',
        orders: 'GET /api/admin/orders',
        products: 'GET /api/admin/products',
        services: 'GET /api/admin/services',
      },
    },
  });
});

module.exports = router;

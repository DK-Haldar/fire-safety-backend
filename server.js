const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Fire Safety Pro API is running!',
    status: 'active',
    timestamp: new Date()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Import routes (if they exist)
try {
  const authRoutes = require('./routes/auth');
  const productRoutes = require('./routes/products');
  const serviceRoutes = require('./routes/services');
  const orderRoutes = require('./routes/orders');
  const dashboardRoutes = require('./routes/dashboard');
  
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  
  console.log('✅ Routes loaded successfully');
} catch (error) {
  console.log('⚠️ Some routes not loaded:', error.message);
}

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB Connected');
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('❌ MongoDB Error:', err.message);
      app.listen(PORT, () => {
        console.log(`⚠️ Server running without database on port ${PORT}`);
      });
    });
} else {
  console.log('⚠️ No MongoDB URI provided');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

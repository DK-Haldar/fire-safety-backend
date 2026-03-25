const mongoose = require('mongoose');
const uri = 'mongodb+srv://usajobhiringsite_db_user:Jimmy9830@cluster0.qongibu.mongodb.net/fire-safety-pro?retryWrites=true&w=majority';

async function check() {
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB Atlas: Connected');
    
    const db = mongoose.connection.db;
    
    // Check users
    const users = await db.collection('users').countDocuments();
    console.log(`👥 Users: ${users}`);
    
    // Check products
    const products = await db.collection('products').countDocuments();
    console.log(`📦 Products: ${products}`);
    
    // Check services
    const services = await db.collection('services').countDocuments();
    console.log(`🔧 Services: ${services}`);
    
    // Check orders
    const orders = await db.collection('orders').countDocuments();
    console.log(`📋 Orders: ${orders}`);
    
    console.log('\n✅ All systems operational!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

check();

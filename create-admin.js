const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const uri = 'mongodb+srv://usajobhiringsite_db_user:Jimmy9830@cluster0.qongibu.mongodb.net/fire-safety-pro?retryWrites=true&w=majority';

async function createAdmin() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = mongoose.connection.db;
    
    // New admin details - CHANGE THESE
    const newAdmin = {
      name: 'Jimmy',        // Change this
      email: 'dkhaldar4u@gmail.com', // Change this
      password: 'Jimmy@9830',      // Change this
      phone: '9332827272',           // Change this
      role: 'admin',
      createdAt: new Date()
    };
    
    // Check if admin already exists
    const existingAdmin = await db.collection('users').findOne({ email: newAdmin.email });
    if (existingAdmin) {
      console.log(`❌ Admin with email ${newAdmin.email} already exists!`);
      process.exit(1);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(newAdmin.password, 10);
    newAdmin.password = hashedPassword;
    
    // Insert new admin
    const result = await db.collection('users').insertOne(newAdmin);
    
    console.log('\n✅ New admin created successfully!');
    console.log('📋 Admin Details:');
    console.log(`   Name: ${newAdmin.name}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Password: ${newAdmin.password === hashedPassword ? '✓ Hashed' : 'Original: ' + newAdmin.password}`);
    console.log(`   Phone: ${newAdmin.phone}`);
    console.log(`   Role: ${newAdmin.role}`);
    console.log(`   ID: ${result.insertedId}`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createAdmin();

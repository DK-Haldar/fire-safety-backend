const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Updated with new password: Jimmy9830
const MONGODB_URI = 'mongodb+srv://usajobhiringsite_db_user:Jimmy9830@cluster0.qongibu.mongodb.net/fire-safety-pro?retryWrites=true&w=majority';

// Sample products data
const products = [
  { name: 'ABC Powder Extinguisher 4kg', category: 'Extinguishers', price: 1999, oldPrice: 2499, rating: 4.8, image: 'https://picsum.photos/id/20/200/200', description: 'ISI marked ABC powder extinguisher for Class A,B,C fires', stock: 50, isActive: true },
  { name: 'CO2 Extinguisher 4.5kg', category: 'Extinguishers', price: 3999, oldPrice: 4599, rating: 4.9, image: 'https://picsum.photos/id/21/200/200', description: 'CO2 extinguisher for electrical fires, leaves no residue', stock: 30, isActive: true },
  { name: 'Foam Extinguisher 6L', category: 'Extinguishers', price: 2999, rating: 4.7, image: 'https://picsum.photos/id/22/200/200', description: 'Foam extinguisher for Class A & B fires', stock: 25, isActive: true },
  { name: 'Fire Blanket', category: 'Accessories', price: 999, rating: 4.6, image: 'https://picsum.photos/id/23/200/200', description: 'Fire blanket for kitchen safety, 1.2m x 1.2m', stock: 100, isActive: true },
  { name: 'Smoke Detector', category: 'Detection', price: 1899, rating: 4.7, image: 'https://picsum.photos/id/24/200/200', description: 'Photoelectric smoke detector with 10-year battery', stock: 75, isActive: true },
  { name: 'Fire Alarm', category: 'Detection', price: 2499, rating: 4.8, image: 'https://picsum.photos/id/25/200/200', description: 'Loud alarm with strobe light', stock: 45, isActive: true },
  { name: 'Extinguisher Stand', category: 'Accessories', price: 899, rating: 4.5, image: 'https://picsum.photos/id/26/200/200', description: 'Heavy-duty stand for fire extinguishers', stock: 120, isActive: true },
  { name: 'Emergency Exit Sign', category: 'Signage', price: 599, rating: 4.4, image: 'https://picsum.photos/id/27/200/200', description: 'LED emergency exit sign', stock: 200, isActive: true },
  { name: 'Heat Detector', category: 'Detection', price: 1499, rating: 4.6, image: 'https://picsum.photos/id/28/200/200', description: 'Fixed temperature heat detector', stock: 60, isActive: true },
  { name: 'Fire Safety Kit', category: 'Kits', price: 4999, oldPrice: 5999, rating: 4.9, image: 'https://picsum.photos/id/29/200/200', description: 'Complete home safety kit', stock: 30, isActive: true }
];

// Sample services data
const services = [
  { name: 'Fire Extinguisher Refilling', description: 'Professional refilling with certification', price: '₹299-499', duration: '24h', icon: '🔄', color: '#FF6B6B', category: 'refill', isActive: true },
  { name: 'Annual Maintenance Contract', description: 'Complete maintenance package', price: '₹1999/year', duration: '12 months', icon: '🔧', color: '#4ECDC4', category: 'amc', isActive: true },
  { name: 'Fire Safety Inspection', description: 'Comprehensive safety audit', price: 'Call for quote', duration: '2-3h', icon: '🔍', color: '#45B7D1', category: 'inspection', isActive: true },
  { name: 'Extinguisher Testing', description: 'Pressure testing and certification', price: '₹199/unit', duration: '1h', icon: '✅', color: '#96CEB4', category: 'testing', isActive: true }
];

async function seedDatabase() {
  try {
    console.log('📡 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');
    
    const db = mongoose.connection.db;
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.collection('products').deleteMany({});
    await db.collection('services').deleteMany({});
    await db.collection('users').deleteMany({});
    console.log('✅ Cleared existing data\n');
    
    // Insert products
    console.log('📦 Adding products...');
    const productResult = await db.collection('products').insertMany(products);
    console.log(`✅ Added ${productResult.insertedCount} products\n`);
    
    // Insert services
    console.log('🔧 Adding services...');
    const serviceResult = await db.collection('services').insertMany(services);
    console.log(`✅ Added ${serviceResult.insertedCount} services\n`);
    
    // Create admin users
    console.log('👤 Creating admin users...');
    
    // Admin 1: default admin
    const admin1Password = await bcrypt.hash('admin123', 10);
    await db.collection('users').insertOne({
      name: 'Admin User',
      email: 'admin@firesafety.com',
      password: admin1Password,
      phone: '9999999999',
      role: 'admin',
      createdAt: new Date()
    });
    console.log('✅ Admin 1: admin@firesafety.com / admin123');
    
    // Admin 2: your custom admin
    const admin2Password = await bcrypt.hash('Jimmy9830', 10);
    await db.collection('users').insertOne({
      name: 'Deepak Haldar',
      email: 'dkhaldar4u@gmail.com',
      password: admin2Password,
      phone: '9332827272',
      role: 'admin',
      createdAt: new Date()
    });
    console.log('✅ Admin 2: dkhaldar4u@gmail.com / Jimmy9830');
    
    // Create test user
    const testPassword = await bcrypt.hash('test123', 10);
    await db.collection('users').insertOne({
      name: 'Test User',
      email: 'test@example.com',
      password: testPassword,
      phone: '9876543210',
      role: 'user',
      createdAt: new Date()
    });
    console.log('✅ Test user: test@example.com / test123\n');
    
    // Summary
    const totalProducts = await db.collection('products').countDocuments();
    const totalServices = await db.collection('services').countDocuments();
    const totalUsers = await db.collection('users').countDocuments();
    
    console.log('📊 Database Summary:');
    console.log(`   Products: ${totalProducts}`);
    console.log(`   Services: ${totalServices}`);
    console.log(`   Users: ${totalUsers}`);
    console.log('\n🎉 Database seeding complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();

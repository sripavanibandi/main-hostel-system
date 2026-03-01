require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const email = 'admin@aditya.edu';
    const plainPassword = 'admin@1234';
    const existing = await User.findOne({ email: email.toLowerCase() });
    
    if (existing) {
      console.log('Admin user already exists:', email);
      process.exit(0);
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    const admin = new User({
      name: 'Admin',
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      rollNumber: '',
      fullName: 'Admin'
    });
    
    await admin.save();
    console.log('Admin user created successfully.');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
  } catch (err) {
    console.error('Error creating admin user:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdminUser();

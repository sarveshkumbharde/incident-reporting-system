const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/user.model.js');

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function createAuthority() {
  try {
    const email = 'sarveshkumbharde@rediffmail.com';
    const password = '123456';

    // Check if authority already exists
    const existingAuthority = await User.findOne({ email });
    if (existingAuthority) {
      console.log('ℹ️ Authority user already exists:', existingAuthority.email);
      console.log('Role:', existingAuthority.role);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create authority user
    const authorityUser = new User({
      firstName: 'Authority',
      lastName: 'User',
      email,
      mobile: '9921232638',
      address: 'Authority Address',
      aadharCard: '745238764371',
      password: hashedPassword,
      role: 'authority',
      approved: true  // ✅ (optional: if your model uses admin approval)
    });

    await authorityUser.save();
    console.log('✅ Authority user created successfully!');
    console.log('Email:', authorityUser.email);
    console.log('Password:', password);
    console.log('Role:', authorityUser.role);
  } catch (error) {
    console.error('❌ Error creating authority user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAuthority();

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/User');
const Match = require('../models/Match');

async function test() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected.');

  // Find or create caller
  let caller = await User.findOne({ email: 'caller@test.com' });
  if (!caller) {
    caller = await User.create({
      name: 'Test Caller',
      email: 'caller@test.com',
      password: 'password123',
      gender: 'Male',
      dateOfBirth: new Date(1995, 1, 1),
      isActive: true,
      isVerified: true
    });
    console.log('Created test caller user.');
  }

  // Find or create receiver
  let receiver = await User.findOne({ email: 'receiver@test.com' });
  if (!receiver) {
    receiver = await User.create({
      name: 'Test Receiver',
      email: 'receiver@test.com',
      password: 'password123',
      gender: 'Female',
      dateOfBirth: new Date(1996, 1, 1),
      isActive: true,
      isVerified: true
    });
    console.log('Created test receiver user.');
  }

  // Ensure they are matched
  let match = await Match.findOne({ users: { $all: [caller._id, receiver._id] } });
  if (!match) {
    match = await Match.create({ users: [caller._id, receiver._id] });
    console.log('Created match record between caller and receiver.');
  }

  // Generate JWT token
  const token = jwt.sign({ id: caller._id }, process.env.JWT_SECRET);
  console.log(`Generated JWT token for caller.`);

  console.log(`\nCaller User ID: ${caller._id}`);
  console.log(`Receiver User ID: ${receiver._id}`);
  console.log(`JWT Token: Bearer ${token}`);

  // Fetch via HTTP using node native fetch
  console.log('\nMaking GET request to can-call API...');
  const res = await fetch(`http://localhost:5000/api/calls/can-call/${receiver._id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await res.json();
  console.log('\nResponse Status:', res.status);
  console.log('Response Body:', JSON.stringify(data, null, 2));

  await mongoose.disconnect();
  console.log('\nDisconnected from MongoDB.');
}

test().catch(err => {
  console.error(err);
  mongoose.disconnect();
});

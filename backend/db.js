const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/photo_posting_db';

  await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${mongoUri}`);
};

module.exports = { connectDB };

const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoConnection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in .env");
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connection successful!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

testMongoConnection();

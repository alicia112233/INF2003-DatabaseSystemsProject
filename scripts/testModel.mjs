// Test importing the Review model directly
import Review from '../src/models/Review.js';
import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/game_haven';

async function testModel() {
  try {
    console.log('🧪 Testing Review model import...');
    console.log('Review model:', !!Review);
    console.log('Review model name:', Review?.modelName);
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    console.log('📊 Testing model query...');
    const count = await Review.countDocuments();
    console.log('✅ Review count:', count);
    
    const sample = await Review.findOne();
    console.log('✅ Sample review:', sample);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testModel();

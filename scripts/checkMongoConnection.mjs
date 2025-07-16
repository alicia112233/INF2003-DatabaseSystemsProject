import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/game_haven';

async function checkMongoConnection() {
  try {
    console.log('🔍 Checking MongoDB connection...');
    console.log('📍 URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    
    const dbName = mongoose.connection.db.databaseName;
    console.log('✅ Connected to MongoDB database:', dbName);
    
    // List all collections in this database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 Collections found in database:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // Check specifically for reviews collection
    const hasReviews = collections.some(c => c.name === 'reviews');
    console.log(`\n🔍 Reviews collection exists: ${hasReviews}`);
    
    if (hasReviews) {
      const reviewsCount = await mongoose.connection.db.collection('reviews').countDocuments();
      console.log(`📊 Total documents in reviews collection: ${reviewsCount}`);
      
      // Get a sample document to check structure
      const sampleReview = await mongoose.connection.db.collection('reviews').findOne();
      if (sampleReview) {
        console.log('\n📝 Sample review document:');
        console.log(`  _id: ${sampleReview._id}`);
        console.log(`  gameId: ${sampleReview.gameId} (type: ${typeof sampleReview.gameId})`);
        console.log(`  userId: ${sampleReview.userId} (type: ${typeof sampleReview.userId})`);
        console.log(`  rating: ${sampleReview.rating} (type: ${typeof sampleReview.rating})`);
        console.log(`  review: "${sampleReview.review.substring(0, 30)}..."`);
        console.log(`  createdAt: ${sampleReview.createdAt}`);
      }
    } else {
      console.log('❌ No reviews collection found!');
      console.log('💡 This might be why reviews are not persisting');
    }
    
    // Check connection details
    console.log('\n🔗 Connection details:');
    console.log(`  Host: ${mongoose.connection.host}`);
    console.log(`  Port: ${mongoose.connection.port}`);
    console.log(`  Database: ${mongoose.connection.name}`);
    console.log(`  Ready state: ${mongoose.connection.readyState} (1 = connected)`);
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 MongoDB server is not running. Start it with:');
      console.log('   - Windows: net start MongoDB');
      console.log('   - macOS: brew services start mongodb-community');
      console.log('   - Linux: sudo systemctl start mongod');
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 MongoDB connection closed');
    }
  }
}

checkMongoConnection();

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/game_haven';

async function checkDataTypes() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Get the collection directly to check raw data
    const db = mongoose.connection.db;
    const collection = db.collection('reviews');
    
    // Find a few sample documents
    const samples = await collection.find({}).limit(5).toArray();
    
    console.log('📊 Sample reviews and their data types:');
    samples.forEach((review, index) => {
      console.log(`\nReview ${index + 1}:`);
      console.log(`  gameId: ${review.gameId} (type: ${typeof review.gameId})`);
      console.log(`  userId: ${review.userId} (type: ${typeof review.userId})`);
      console.log(`  rating: ${review.rating} (type: ${typeof review.rating})`);
      console.log(`  review: "${review.review.substring(0, 30)}..."`);
    });

    // Check what types we have in the entire collection
    const pipeline = [
      {
        $group: {
          _id: null,
          gameIdTypes: { $addToSet: { $type: "$gameId" } },
          userIdTypes: { $addToSet: { $type: "$userId" } },
          totalCount: { $sum: 1 }
        }
      }
    ];
    
    const typeAnalysis = await collection.aggregate(pipeline).toArray();
    console.log('\n📈 Data type analysis:');
    console.log('  gameId types found:', typeAnalysis[0]?.gameIdTypes || []);
    console.log('  userId types found:', typeAnalysis[0]?.userIdTypes || []);
    console.log('  Total documents:', typeAnalysis[0]?.totalCount || 0);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

checkDataTypes();

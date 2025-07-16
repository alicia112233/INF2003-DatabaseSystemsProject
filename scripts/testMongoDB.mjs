import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/game_haven';

// Review schema - same as in your model
const reviewSchema = new mongoose.Schema({
  gameId: { type: String, required: true },
  userId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

async function testReviews() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Count total reviews
    const totalCount = await Review.countDocuments();
    console.log(`📊 Total reviews in database: ${totalCount}`);

    // Test querying by gameId (use a gameId from your reviews.json)
    const testGameId = "1180030"; // From your reviews.json as string
    const gameReviews = await Review.find({ gameId: testGameId });
    console.log(`🎮 Reviews for game ${testGameId}: ${gameReviews.length}`);

    if (gameReviews.length > 0) {
      console.log('📝 Sample review:', {
        gameId: gameReviews[0].gameId,
        userId: gameReviews[0].userId,
        rating: gameReviews[0].rating,
        review: gameReviews[0].review.substring(0, 50) + '...',
        createdAt: gameReviews[0].createdAt
      });
    }

    // Test creating a new review
    console.log('🧪 Testing review creation...');
    const testReview = await Review.create({
      gameId: "999999",               // String to match existing data
      userId: "999",                  // String to match existing data
      rating: 5,
      review: "Test review for debugging",
      createdAt: new Date()
    });
    console.log('✅ Test review created:', testReview._id);

    // Clean up test review
    await Review.deleteOne({ _id: testReview._id });
    console.log('🧹 Test review cleaned up');

  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

testReviews();

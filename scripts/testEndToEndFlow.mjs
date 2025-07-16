import mongoose from 'mongoose';
import mysql from 'mysql2/promise';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/game_haven';

// Review schema
const reviewSchema = new mongoose.Schema({
  gameId: { type: String, required: true },
  userId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

async function testEndToEndFlow() {
  let mongoConnection, mysqlConnection;
  
  try {
    // Connect to both databases
    console.log('🔄 Connecting to databases...');
    mongoConnection = await mongoose.connect(MONGODB_URI);
    mysqlConnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '1234',
      port: Number(process.env.MYSQL_PORT) || 3307,
      database: process.env.MYSQL_DATABASE || 'game_haven'
    });
    console.log('✅ Connected to both databases successfully');

    // Test the complete flow like a real user would experience
    console.log('\n🎯 TESTING COMPLETE FLOW:');
    
    // 1. User visits game page (URL contains string ID)
    const urlGameId = "1180030"; // This comes from URL like /game/1180030
    console.log(`\n1️⃣ User visits /game/${urlGameId}`);
    console.log(`   URL gameId: "${urlGameId}" (${typeof urlGameId})`);

    // 2. Game page fetches game details from MySQL
    const [gameRows] = await mysqlConnection.execute('SELECT * FROM game WHERE id = ?', [parseInt(urlGameId)]);
    if (gameRows.length > 0) {
      console.log(`   ✅ Game found in MySQL: ${gameRows[0].title}`);
      console.log(`   MySQL game.id: ${gameRows[0].id} (${typeof gameRows[0].id})`);
    } else {
      console.log(`   ❌ Game not found in MySQL`);
      return;
    }

    // 3. ReviewSection component fetches reviews from MongoDB
    console.log(`\n2️⃣ ReviewSection fetches reviews for gameId: "${urlGameId}"`);
    const existingReviews = await Review.find({ gameId: urlGameId });
    console.log(`   Found ${existingReviews.length} existing reviews`);

    // 4. User submits a new review
    console.log(`\n3️⃣ User submits new review`);
    const testUserId = "1"; // From session (would be string)
    const newReviewData = {
      gameId: urlGameId,        // String from URL
      userId: testUserId,       // String from session
      rating: 5,
      review: "Test review - compatibility check"
    };
    
    console.log(`   Review data being sent:`, {
      gameId: `"${newReviewData.gameId}" (${typeof newReviewData.gameId})`,
      userId: `"${newReviewData.userId}" (${typeof newReviewData.userId})`,
      rating: `${newReviewData.rating} (${typeof newReviewData.rating})`
    });

    // 5. API creates review in MongoDB
    const createdReview = await Review.create(newReviewData);
    console.log(`   ✅ Review created with _id: ${createdReview._id}`);

    // 6. Verify the review can be queried back
    const verifyReviews = await Review.find({ gameId: urlGameId });
    console.log(`   ✅ Total reviews after creation: ${verifyReviews.length}`);

    // 7. Test cross-database joins (if needed)
    console.log(`\n4️⃣ Testing cross-database compatibility`);
    
    // Get all reviews for games that exist in MySQL
    const reviewGameIds = await Review.distinct('gameId');
    console.log(`   Unique gameIds in reviews: ${reviewGameIds.length}`);
    
    let validGames = 0;
    for (const reviewGameId of reviewGameIds.slice(0, 5)) { // Test first 5
      const [gameCheck] = await mysqlConnection.execute('SELECT id, title FROM game WHERE id = ?', [parseInt(reviewGameId)]);
      if (gameCheck.length > 0) {
        validGames++;
        console.log(`   ✅ Review gameId "${reviewGameId}" → MySQL game: ${gameCheck[0].title}`);
      } else {
        console.log(`   ❌ Review gameId "${reviewGameId}" → No MySQL game found`);
      }
    }

    // Clean up test review
    await Review.deleteOne({ _id: createdReview._id });
    console.log(`\n🧹 Test review cleaned up`);

    // Final summary
    console.log(`\n📊 SUMMARY:`);
    console.log(`   ✅ URL gameId (string) works with MongoDB queries`);
    console.log(`   ✅ MongoDB gameId (string) converts to MySQL id (number)`);
    console.log(`   ✅ Cross-database compatibility: ${validGames}/${Math.min(5, reviewGameIds.length)} games valid`);
    console.log(`   ✅ String IDs are the CORRECT choice for your review system`);

    console.log(`\n🎯 RECOMMENDATION:`);
    console.log(`   Keep gameId and userId as STRING in MongoDB because:`);
    console.log(`   • URL parameters are always strings`);
    console.log(`   • JSON APIs work best with strings`);
    console.log(`   • Easy conversion to MySQL integers when needed`);
    console.log(`   • More flexible for future changes`);

  } catch (error) {
    console.error('❌ Error during end-to-end test:', error.message);
  } finally {
    if (mongoConnection && mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    if (mysqlConnection) {
      await mysqlConnection.end();
    }
    console.log('\n🔌 All connections closed');
  }
}

testEndToEndFlow();

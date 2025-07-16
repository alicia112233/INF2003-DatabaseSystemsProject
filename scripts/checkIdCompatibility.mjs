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

async function checkIdCompatibility() {
  let mongoConnection, mysqlConnection;
  
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    mongoConnection = await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');

    // Connect to MySQL
    console.log('🔄 Connecting to MySQL...');
    mysqlConnection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '1234',
      port: Number(process.env.MYSQL_PORT) || 3307,
      database: process.env.MYSQL_DATABASE || 'game_haven'
    });
    console.log('✅ Connected to MySQL successfully');

    // Get sample Game IDs from MySQL
    console.log('\n🎮 Sample Game IDs from MySQL:');
    const [games] = await mysqlConnection.execute('SELECT id, title FROM game LIMIT 5');
    games.forEach(game => {
      console.log(`  ID: ${game.id} (type: ${typeof game.id}) - Title: ${game.title.substring(0, 30)}...`);
    });

    // Get sample User IDs from MySQL  
    console.log('\n👤 Sample User IDs from MySQL:');
    const [users] = await mysqlConnection.execute('SELECT id, firstName, lastName FROM users LIMIT 5');
    users.forEach(user => {
      console.log(`  ID: ${user.id} (type: ${typeof user.id}) - Name: ${user.firstName} ${user.lastName}`);
    });

    // Get sample review data from MongoDB
    console.log('\n📝 Sample Review IDs from MongoDB:');
    const reviews = await Review.find({}).limit(5);
    reviews.forEach((review, index) => {
      console.log(`  Review ${index + 1}:`);
      console.log(`    gameId: ${review.gameId} (type: ${typeof review.gameId})`);
      console.log(`    userId: ${review.userId} (type: ${typeof review.userId})`);
    });

    // Test cross-database matching
    console.log('\n🔍 Testing ID matching compatibility:');
    
    // Check if any MySQL game IDs match MongoDB review gameIds
    const sampleGameId = games[0].id;
    const stringGameId = sampleGameId.toString();
    console.log(`\n  Testing gameId matching:`);
    console.log(`    MySQL game ID: ${sampleGameId} (${typeof sampleGameId})`);
    console.log(`    String version: "${stringGameId}" (${typeof stringGameId})`);
    
    // Look for reviews with this gameId
    const matchingReviews = await Review.find({ gameId: stringGameId });
    console.log(`    Reviews found for gameId "${stringGameId}": ${matchingReviews.length}`);

    // Test with a known gameId from reviews.json
    const knownGameId = "1180030";
    console.log(`\n  Testing with known gameId from reviews.json:`);
    const knownGameReviews = await Review.find({ gameId: knownGameId });
    console.log(`    Reviews for gameId "${knownGameId}": ${knownGameReviews.length}`);
    
    // Check if this gameId exists in MySQL
    const [mysqlGameCheck] = await mysqlConnection.execute('SELECT id, title FROM game WHERE id = ?', [parseInt(knownGameId)]);
    if (mysqlGameCheck.length > 0) {
      console.log(`    ✅ Game ${knownGameId} exists in MySQL: ${mysqlGameCheck[0].title}`);
    } else {
      console.log(`    ❌ Game ${knownGameId} NOT found in MySQL`);
    }

    // Summary and recommendations
    console.log('\n📋 COMPATIBILITY ANALYSIS:');
    console.log('  ✅ MongoDB stores gameId and userId as strings');
    console.log('  ✅ MySQL stores game.id and users.id as integers');
    console.log('  ✅ JavaScript can convert between string and number seamlessly');
    console.log('  ✅ String format is better for web APIs and URL parameters');
    
    // Test conversion examples
    console.log('\n🧪 Conversion Examples:');
    const testNumId = 12345;
    const testStrId = "12345";
    console.log(`  Number to String: ${testNumId} → "${testNumId.toString()}"`);
    console.log(`  String to Number: "${testStrId}" → ${parseInt(testStrId)}`);
    console.log(`  Equality check: ${testNumId} == "${testNumId}" → ${testNumId == testStrId}`);
    console.log(`  Strict equality: ${testNumId} === parseInt("${testStrId}") → ${testNumId === parseInt(testStrId)}`);

  } catch (error) {
    console.error('❌ Error during compatibility check:', error.message);
  } finally {
    // Clean up connections
    if (mongoConnection && mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\n🔌 MongoDB connection closed');
    }
    if (mysqlConnection) {
      await mysqlConnection.end();
      console.log('🔌 MySQL connection closed');
    }
  }
}

checkIdCompatibility();

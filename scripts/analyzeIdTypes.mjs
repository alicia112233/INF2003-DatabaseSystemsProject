import mongoose from 'mongoose';
import mysql from 'mysql2/promise';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/game_haven';

async function analyzeIdCompatibility() {
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
    console.log('✅ Connected to both databases\n');

    // Check MySQL data types and sample data
    console.log('🎮 MYSQL GAME TABLE:');
    const [games] = await mysqlConnection.execute('SELECT id, title FROM game LIMIT 3');
    games.forEach(game => {
      console.log(`  Game ID: ${game.id} (type: ${typeof game.id}) - ${game.title.substring(0, 30)}...`);
    });

    console.log('\n👤 MYSQL USERS TABLE:');
    const [users] = await mysqlConnection.execute('SELECT id, firstName, lastName FROM users LIMIT 3');
    users.forEach(user => {
      console.log(`  User ID: ${user.id} (type: ${typeof user.id}) - ${user.firstName} ${user.lastName}`);
    });

    // Check MongoDB reviews data
    console.log('\n📝 MONGODB REVIEWS COLLECTION:');
    const db = mongoose.connection.db;
    const reviews = await db.collection('reviews').find({}).limit(3).toArray();
    reviews.forEach((review, i) => {
      console.log(`  Review ${i+1}:`);
      console.log(`    gameId: ${review.gameId} (type: ${typeof review.gameId})`);
      console.log(`    userId: ${review.userId} (type: ${typeof review.userId})`);
    });

    // Test cross-database matching scenarios
    console.log('\n🔍 TESTING ID MATCHING SCENARIOS:\n');

    // Scenario 1: Current setup (string in MongoDB)
    console.log('📋 Scenario 1: MongoDB stores IDs as STRINGS');
    const stringGameId = "1180030";
    const [gameCheck1] = await mysqlConnection.execute('SELECT id, title FROM game WHERE id = ?', [parseInt(stringGameId)]);
    const mongoReviews1 = await db.collection('reviews').find({ gameId: stringGameId }).toArray();
    
    console.log(`  MongoDB query: { gameId: "${stringGameId}" } → ${mongoReviews1.length} reviews`);
    console.log(`  MySQL query: WHERE id = ${parseInt(stringGameId)} → ${gameCheck1.length > 0 ? 'Game found: ' + gameCheck1[0]?.title : 'No game found'}`);
    console.log(`  Conversion needed: String "${stringGameId}" → Number ${parseInt(stringGameId)} ✅`);

    // Scenario 2: If we used numbers in MongoDB
    console.log('\n📋 Scenario 2: MongoDB stores IDs as NUMBERS');
    const numberGameId = 1180030;
    const [gameCheck2] = await mysqlConnection.execute('SELECT id, title FROM game WHERE id = ?', [numberGameId]);
    const mongoReviews2 = await db.collection('reviews').find({ gameId: numberGameId }).toArray();
    
    console.log(`  MongoDB query: { gameId: ${numberGameId} } → ${mongoReviews2.length} reviews`);
    console.log(`  MySQL query: WHERE id = ${numberGameId} → ${gameCheck2.length > 0 ? 'Game found: ' + gameCheck2[0]?.title : 'No game found'}`);
    console.log(`  Conversion needed: None - direct match ✅`);

    // Real-world usage analysis
    console.log('\n🌍 REAL-WORLD USAGE ANALYSIS:\n');

    // How gameId comes from URL
    console.log('🔗 URL Parameter Flow:');
    console.log('  URL: /game/1180030');
    console.log('  Next.js params.id: "1180030" (always string)');
    console.log('  API receives: gameId = "1180030" (string)');

    // Current conversion requirements
    console.log('\n🔄 Current Conversion Requirements:');
    console.log('  Frontend → API: No conversion (string → string)');
    console.log('  API → MongoDB: No conversion (string → string)');
    console.log('  MongoDB gameId → MySQL lookup: parseInt("1180030") → 1180030');

    // If we changed to numbers
    console.log('\n🔄 If Changed to Numbers:');
    console.log('  Frontend → API: No conversion (string stays string)');
    console.log('  API → MongoDB: parseInt(gameId) (string → number)');
    console.log('  MongoDB gameId → MySQL lookup: Direct use (number → number)');

    // Performance considerations
    console.log('\n⚡ PERFORMANCE CONSIDERATIONS:');
    console.log('  String storage: ~12 bytes per gameId');
    console.log('  Number storage: ~8 bytes per gameId');
    console.log('  Query performance: Numbers slightly faster for indexes');
    console.log('  Conversion overhead: Minimal in both cases');

    // Recommendation analysis
    console.log('\n🎯 RECOMMENDATION ANALYSIS:\n');

    const totalReviews = await db.collection('reviews').countDocuments();
    const uniqueGameIds = await db.collection('reviews').distinct('gameId');
    
    console.log(`📊 Current Data:`)
    console.log(`  Total reviews: ${totalReviews}`);
    console.log(`  Unique gameIds: ${uniqueGameIds.length}`);
    console.log(`  Current storage: All as strings`);

    // Check if all string gameIds can be converted to valid numbers
    let validConversions = 0;
    for (const gameId of uniqueGameIds.slice(0, 10)) { // Check first 10
      const parsed = parseInt(gameId);
      if (!isNaN(parsed) && parsed.toString() === gameId) {
        validConversions++;
      }
    }

    console.log(`\n✅ FINAL RECOMMENDATION:`);
    if (validConversions === Math.min(10, uniqueGameIds.length)) {
      console.log(`  BEST CHOICE: INTEGER (Number) in MongoDB`);
      console.log(`  Reasons:`);
      console.log(`    • Direct match with MySQL integer IDs`);
      console.log(`    • Better performance for queries and indexes`);
      console.log(`    • Smaller storage footprint`);
      console.log(`    • All current string IDs convert cleanly`);
      console.log(`    • Only need one conversion: URL string → MongoDB number`);
    } else {
      console.log(`  BEST CHOICE: STRING in MongoDB`);
      console.log(`  Reasons:`);
      console.log(`    • Some IDs cannot convert cleanly to numbers`);
      console.log(`    • Matches URL parameter format`);
      console.log(`    • More flexible for future changes`);
    }

  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
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

analyzeIdCompatibility();

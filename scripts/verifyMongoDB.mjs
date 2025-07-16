import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

// Load environment variables
config();

const uri = process.env.MONGODB_URI;

async function verifyMongoDB() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('🔌 Connected to MongoDB');
    
    const db = client.db('game_haven');
    
    // List all databases
    const admin = client.db().admin();
    const databases = await admin.listDatabases();
    const gameHavenExists = databases.databases.some(db => db.name === 'game_haven');
    
    console.log('📊 Available databases:', databases.databases.map(db => db.name));
    console.log('✅ game_haven database exists:', gameHavenExists);
    
    if (gameHavenExists) {
      // List collections in game_haven
      const collections = await db.listCollections().toArray();
      console.log('📁 Collections in game_haven:', collections.map(col => col.name));
      
      // Check reviews collection
      if (collections.some(col => col.name === 'reviews')) {
        const reviewsCollection = db.collection('reviews');
        const reviewCount = await reviewsCollection.countDocuments();
        console.log('📝 Number of reviews in collection:', reviewCount);
        
        // Show sample review if any exist
        if (reviewCount > 0) {
          const sampleReview = await reviewsCollection.findOne();
          console.log('📄 Sample review:', {
            gameId: sampleReview.gameId,
            userId: sampleReview.userId,
            rating: sampleReview.rating,
            reviewText: sampleReview.reviewText?.substring(0, 50) + '...'
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

verifyMongoDB();

import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

// Load environment variables
config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is missing in .env file");
}

async function initializeMongoDB() {
  const client = new MongoClient(uri);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    
    // Connect to the game_haven database (this creates it if it doesn't exist)
    const db = client.db('game_haven');
    
    // Check if database exists by listing collections
    const collections = await db.listCollections().toArray();
    console.log('Connected to MongoDB database: game_haven');
    
    // Create the reviews collection if it doesn't exist
    const reviewsCollectionExists = collections.some(col => col.name === 'reviews');
    
    if (!reviewsCollectionExists) {
      console.log('Creating reviews collection...');
      await db.createCollection('reviews');
      console.log('Reviews collection created successfully');
    } else {
      console.log('Reviews collection already exists');
    }
    
    // Optionally, you can create indexes for better performance
    const reviewsCollection = db.collection('reviews');
    
    // Create indexes on gameId and userId for better query performance
    try {
      await reviewsCollection.createIndex({ gameId: 1 });
      await reviewsCollection.createIndex({ userId: 1 });
      await reviewsCollection.createIndex({ gameId: 1, userId: 1 }, { unique: true });
      console.log('Database indexes created successfully');
    } catch (indexError) {
      // Indexes might already exist, which is fine
      console.log('Database indexes already exist or created');
    }
    
    console.log('MongoDB initialization completed successfully!');
    
  } catch (error) {
    console.error('MongoDB initialization failed:', error.message);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the initialization
initializeMongoDB().catch(error => {
  console.error('Failed to initialize MongoDB:', error);
  process.exit(1);
});

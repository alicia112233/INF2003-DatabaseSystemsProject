const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gamestore';

async function testReviewsAPI() {
    let client;
    
    try {
        // Connect to MongoDB
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('gamestore');
        const reviewsCollection = db.collection('reviews');
        
        // Test finding reviews by gameId
        const gameId = '1180030';
        console.log(`\nSearching for reviews with gameId: ${gameId}`);
        
        const reviews = await reviewsCollection.find({ gameId }).toArray();
        console.log(`Found ${reviews.length} reviews for gameId ${gameId}`);
        
        if (reviews.length > 0) {
            console.log('Sample review:', reviews[0]);
        }
        
        // Check what gameIds exist
        const distinctGameIds = await reviewsCollection.distinct('gameId');
        console.log(`\nDistinct gameIds in database: ${distinctGameIds.slice(0, 10).join(', ')}...`);
        
        // Test with a different gameId that we know exists
        const testGameId = distinctGameIds[0];
        const testReviews = await reviewsCollection.find({ gameId: testGameId }).toArray();
        console.log(`\nTesting with gameId ${testGameId}: found ${testReviews.length} reviews`);
        
        if (testReviews.length > 0) {
            console.log('Sample review for testing:', testReviews[0]);
        }
        
    } catch (error) {
        console.error('Error testing reviews API:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('\nMongoDB connection closed');
        }
    }
}

// Run the test
testReviewsAPI();

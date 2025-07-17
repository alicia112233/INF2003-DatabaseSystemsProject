const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/game_haven';

async function checkGameReviews() {
    let client;
    
    try {
        // Connect to MongoDB
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('game_haven');
        const reviewsCollection = db.collection('reviews');
        
        // Check for specific game ID
        const gameId = '278440';
        console.log(`\nChecking reviews for game ID: ${gameId}`);
        
        const gameReviews = await reviewsCollection.find({ gameId }).toArray();
        console.log(`Found ${gameReviews.length} reviews for game ${gameId}`);
        
        if (gameReviews.length > 0) {
            console.log('Reviews for this game:');
            gameReviews.forEach((review, index) => {
                console.log(`${index + 1}. User ${review.userId}: ${review.rating} stars - "${review.comment}"`);
            });
        } else {
            console.log('No reviews found for this game ID');
            
            // Show all available game IDs
            const allGameIds = await reviewsCollection.distinct('gameId');
            console.log('\nAvailable game IDs in database:');
            allGameIds.sort().forEach(id => console.log(`- ${id}`));
            
            // Find a similar game ID if possible
            const similarGameId = allGameIds.find(id => id.includes('278') || id.includes('440'));
            if (similarGameId) {
                console.log(`\nFound similar game ID: ${similarGameId}`);
                const similarReviews = await reviewsCollection.find({ gameId: similarGameId }).toArray();
                console.log(`It has ${similarReviews.length} reviews`);
            }
        }
        
    } catch (error) {
        console.error('Error checking reviews:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('\nMongoDB connection closed');
        }
    }
}

// Run the check
checkGameReviews();

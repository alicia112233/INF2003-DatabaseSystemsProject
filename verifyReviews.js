const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/game_haven';

async function verifyReviews() {
    let client;
    
    try {
        // Connect to MongoDB
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('game_haven');
        const reviewsCollection = db.collection('reviews');
        
        // Get collection stats
        const totalCount = await reviewsCollection.countDocuments();
        console.log(`Total reviews in collection: ${totalCount}`);
        
        // Get rating distribution
        const ratingDistribution = await reviewsCollection.aggregate([
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]).toArray();
        
        console.log('\nRating distribution:');
        ratingDistribution.forEach(item => {
            console.log(`${item._id} stars: ${item.count} reviews`);
        });
        
        // Get reviews by game (top 5 games with most reviews)
        const gameStats = await reviewsCollection.aggregate([
            {
                $group: {
                    _id: '$gameId',
                    reviewCount: { $sum: 1 },
                    avgRating: { $avg: '$rating' }
                }
            },
            { $sort: { reviewCount: -1 } },
            { $limit: 5 }
        ]).toArray();
        
        console.log('\nTop 5 games with most reviews:');
        gameStats.forEach(game => {
            console.log(`Game ${game._id}: ${game.reviewCount} reviews, avg rating: ${game.avgRating.toFixed(1)}`);
        });
        
        // Get reviews by user
        const userStats = await reviewsCollection.aggregate([
            {
                $group: {
                    _id: '$userId',
                    reviewCount: { $sum: 1 },
                    avgRating: { $avg: '$rating' }
                }
            },
            { $sort: { reviewCount: -1 } }
        ]).toArray();
        
        console.log('\nReviews by user:');
        userStats.forEach(user => {
            console.log(`User ${user._id}: ${user.reviewCount} reviews, avg rating given: ${user.avgRating.toFixed(1)}`);
        });
        
        // Sample recent reviews
        const recentReviews = await reviewsCollection.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();
        
        console.log('\n5 most recent reviews:');
        recentReviews.forEach(review => {
            console.log(`${review.createdAt.toISOString().split('T')[0]}: Game ${review.gameId} - ${review.rating} stars - "${review.comment}"`);
        });
        
    } catch (error) {
        console.error('Error verifying reviews:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('\nMongoDB connection closed');
        }
    }
}

// Run the verification
verifyReviews();

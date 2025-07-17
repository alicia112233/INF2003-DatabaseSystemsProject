const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/game_haven';

async function populateReviews() {
    let client;
    
    try {
        // Read reviews data
        const reviewsPath = path.join(__dirname, 'backend', 'data', 'reviews.json');
        const reviewsData = JSON.parse(fs.readFileSync(reviewsPath, 'utf8'));
        
        console.log(`Found ${reviewsData.length} reviews to insert`);
        
        // Connect to MongoDB
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('Connected to MongoDB');
        
        const db = client.db('game_haven');
        const reviewsCollection = db.collection('reviews');
        
        // Clear existing reviews (optional - comment out if you want to keep existing data)
        await reviewsCollection.deleteMany({});
        console.log('Cleared existing reviews');
        
        // Transform data to match MongoDB schema
        const transformedReviews = reviewsData.map(review => ({
            userId: review.userId.toString(), // Convert to string as expected by the schema
            gameId: review.gameId.toString(), // Convert to string as expected by the schema
            rating: review.rating,
            comment: review.review, // Map 'review' field to 'comment' field
            createdAt: new Date(review.createdAt), // Convert string to Date object
            updatedAt: new Date(review.createdAt) // Set updatedAt to same as createdAt initially
        }));
        
        // Insert reviews in batches
        const batchSize = 100;
        let insertedCount = 0;
        
        for (let i = 0; i < transformedReviews.length; i += batchSize) {
            const batch = transformedReviews.slice(i, i + batchSize);
            const result = await reviewsCollection.insertMany(batch);
            insertedCount += result.insertedCount;
            console.log(`Inserted ${insertedCount}/${transformedReviews.length} reviews`);
        }
        
        console.log(`Successfully inserted ${insertedCount} reviews into MongoDB`);
        
        // Verify insertion
        const count = await reviewsCollection.countDocuments();
        console.log(`Total reviews in collection: ${count}`);
        
        // Show sample of inserted data
        const sampleReviews = await reviewsCollection.find({}).limit(3).toArray();
        console.log('\nSample inserted reviews:');
        sampleReviews.forEach(review => {
            console.log(`- Game ${review.gameId}: ${review.rating} stars - "${review.comment}"`);
        });
        
    } catch (error) {
        console.error('Error populating reviews:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('MongoDB connection closed');
        }
    }
}

// Run the script
populateReviews();

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
        
        console.log('Checking for existing reviews...');
        
        // Transform data to match MongoDB schema
        const transformedReviews = reviewsData.map(review => ({
            userId: review.userId, // Keep as integer
            gameId: review.gameId, // Keep as integer
            rating: review.rating,
            review: review.review, // Keep 'review' field as is
            createdAt: new Date(review.createdAt), // Convert string to Date object
            updatedAt: new Date(review.createdAt) // Set updatedAt to same as createdAt initially
        }));
        
        // Check for duplicates and filter out existing reviews
        const newReviews = [];
        let skippedCount = 0;
        
        for (const review of transformedReviews) {
            // Check if a review with the same userId and gameId already exists
            const existingReview = await reviewsCollection.findOne({
                userId: review.userId,
                gameId: review.gameId
            });
            
            if (!existingReview) {
                newReviews.push(review);
            } else {
                skippedCount++;
            }
        }
        
        console.log(`Found ${newReviews.length} new reviews to insert`);
        console.log(`Skipped ${skippedCount} existing reviews`);
        
        let insertedCount = 0;
        
        if (newReviews.length === 0) {
            console.log('No new reviews to insert. All reviews already exist.');
        } else {
            // Insert new reviews in batches
            const batchSize = 100;
            
            for (let i = 0; i < newReviews.length; i += batchSize) {
                const batch = newReviews.slice(i, i + batchSize);
                const result = await reviewsCollection.insertMany(batch);
                insertedCount += result.insertedCount;
                console.log(`Inserted ${insertedCount}/${newReviews.length} new reviews`);
            }
        }
        
        console.log(`Successfully inserted ${newReviews.length > 0 ? insertedCount : 0} new reviews into MongoDB`);
        
        // Verify insertion
        const totalCount = await reviewsCollection.countDocuments();
        console.log(`Total reviews in collection: ${totalCount}`);
        
        // Show sample of inserted data (if any new reviews were added)
        if (newReviews.length > 0) {
            const sampleReviews = await reviewsCollection.find({}).limit(3).toArray();
            console.log('\nSample reviews in collection:');
            sampleReviews.forEach(review => {
                console.log(`- Game ${review.gameId}: ${review.rating} stars - "${review.review}"`);
            });
        }
        
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

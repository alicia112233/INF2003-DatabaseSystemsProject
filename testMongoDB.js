const { MongoClient } = require('mongodb');

async function testMongoDB() {
    console.log('🔗 Testing MongoDB connection...');
    
    let client;
    try {
        // Connect to MongoDB
        client = new MongoClient('mongodb://localhost:27017/game_haven');
        await client.connect();
        console.log('✅ Connected to MongoDB successfully');
        
        const db = client.db('game_haven');
        
        // Test database access
        console.log('📊 Database name:', db.databaseName);
        
        // List collections
        const collections = await db.listCollections().toArray();
        console.log('📋 Collections:', collections.map(c => c.name));
        
        // Check reviews collection
        const reviewsCollection = db.collection('reviews');
        const reviewsCount = await reviewsCollection.countDocuments();
        console.log('📝 Total reviews in collection:', reviewsCount);
        
        // Check field structure
        const sample = await reviewsCollection.findOne();
        if (sample) {
            console.log('\n🔍 Sample document fields:', Object.keys(sample));
            console.log('📋 Sample document:', JSON.stringify(sample, null, 2));
        }
        
        // Check field usage
        const reviewFieldCount = await reviewsCollection.countDocuments({review: {$exists: true}});
        const commentFieldCount = await reviewsCollection.countDocuments({comment: {$exists: true}});
        console.log('\n📊 Documents with "review" field:', reviewFieldCount);
        console.log('📊 Documents with "comment" field:', commentFieldCount);
        
        // Check recent documents
        const recent = await reviewsCollection.find().sort({createdAt: -1}).limit(3).toArray();
        console.log('\n🕐 Recent reviews:');
        recent.forEach((doc, i) => {
            console.log(`${i+1}. Fields: ${Object.keys(doc).join(', ')}`);
            console.log(`   Review text: "${doc.review || doc.comment || 'NO TEXT'}"`);
            console.log(`   Game ID: ${doc.gameId}, User ID: ${doc.userId}, Rating: ${doc.rating}`);
            console.log('');
        });
        
        console.log('🎯 MongoDB connection test completed successfully!');
        
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (client) {
            await client.close();
            console.log('🔒 MongoDB connection closed');
        }
    }
}

// Run the test
testMongoDB();

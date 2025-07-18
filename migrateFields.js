const { MongoClient } = require('mongodb');

async function migrateCommentToReview() {
    console.log('🔄 Migrating comment fields to review fields...');
    
    let client;
    try {
        client = new MongoClient('mongodb://localhost:27017/game_haven');
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        const db = client.db('game_haven');
        const reviewsCollection = db.collection('reviews');
        
        // Find documents that have comment but no review, or empty review
        const documentsToMigrate = await reviewsCollection.find({
            $or: [
                { comment: { $exists: true, $ne: '' }, review: { $exists: false } },
                { comment: { $exists: true, $ne: '' }, review: '' },
                { comment: { $exists: true, $ne: '' }, review: { $exists: true, $ne: '' } } // Both exist, prefer comment for consistency
            ]
        }).toArray();
        
        console.log(`📋 Found ${documentsToMigrate.length} documents to migrate`);
        
        if (documentsToMigrate.length > 0) {
            // Show sample of what will be migrated
            console.log('\n🔍 Sample documents to migrate:');
            documentsToMigrate.slice(0, 3).forEach((doc, i) => {
                console.log(`${i+1}. ID: ${doc._id}`);
                console.log(`   Current review: "${doc.review || 'EMPTY'}"`);
                console.log(`   Current comment: "${doc.comment || 'EMPTY'}"`);
                console.log(`   Will set review to: "${doc.comment}"`);
                console.log('');
            });
            
            // Migrate the data
            let migratedCount = 0;
            for (const doc of documentsToMigrate) {
                await reviewsCollection.updateOne(
                    { _id: doc._id },
                    {
                        $set: { review: doc.comment },
                        $unset: { comment: '' } // Remove the comment field
                    }
                );
                migratedCount++;
                
                if (migratedCount % 10 === 0) {
                    console.log(`✅ Migrated ${migratedCount}/${documentsToMigrate.length} documents`);
                }
            }
            
            console.log(`🎯 Successfully migrated ${migratedCount} documents`);
        }
        
        // Verify the migration
        const reviewFieldCount = await reviewsCollection.countDocuments({review: {$exists: true, $ne: ''}});
        const commentFieldCount = await reviewsCollection.countDocuments({comment: {$exists: true, $ne: ''}});
        
        console.log('\n📊 After migration:');
        console.log(`   Documents with review field: ${reviewFieldCount}`);
        console.log(`   Documents with comment field: ${commentFieldCount}`);
        
        // Show sample of migrated data
        const recent = await reviewsCollection.find().sort({createdAt: -1}).limit(3).toArray();
        console.log('\n🕐 Recent reviews after migration:');
        recent.forEach((doc, i) => {
            console.log(`${i+1}. Fields: ${Object.keys(doc).join(', ')}`);
            console.log(`   Review text: "${doc.review || 'NO TEXT'}"`);
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Migration error:', error.message);
    } finally {
        if (client) {
            await client.close();
            console.log('🔒 MongoDB connection closed');
        }
    }
}

migrateCommentToReview();

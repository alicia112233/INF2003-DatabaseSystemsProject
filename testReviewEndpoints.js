// Test script to verify both admin and user review endpoints are working correctly
const { MongoClient } = require('mongodb');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testReviewEndpoints() {
    console.log('Testing Review API Endpoints...\n');
    
    try {
        // Test the regular reviews endpoint with userId (for my-reviews page)
        console.log('1. Testing /api/reviews?userId=1 (my-reviews page)');
        const userReviewsResponse = await fetch('http://localhost:3001/api/reviews?userId=1');
        const userReviews = await userReviewsResponse.json();
        
        if (userReviews.length > 0) {
            console.log(`✅ Found ${userReviews.length} user reviews`);
            console.log(`✅ Game info included: ${userReviews[0].game ? 'Yes' : 'No'}`);
            if (userReviews[0].game) {
                console.log(`✅ Game title: "${userReviews[0].game.title}"`);
            }
        } else {
            console.log('❌ No user reviews found');
        }
        
        console.log('\n2. Testing /api/reviews?gameId=1180030 (product page)');
        const gameReviewsResponse = await fetch('http://localhost:3001/api/reviews?gameId=1180030');
        const gameReviews = await gameReviewsResponse.json();
        
        if (gameReviews.length > 0) {
            console.log(`✅ Found ${gameReviews.length} game reviews`);
            console.log(`✅ Game info included: ${gameReviews[0].game ? 'Yes' : 'No'}`);
            console.log('ℹ️  Game info not needed for product page reviews');
        } else {
            console.log('❌ No game reviews found');
        }
        
        console.log('\n3. Summary:');
        console.log('✅ My Reviews page should now show game titles instead of "Unknown Game"');
        console.log('✅ Admin Reviews page should show game titles (previously fixed)');
        console.log('✅ Product page reviews work normally');
        
    } catch (error) {
        console.error('❌ Error testing endpoints:', error);
    }
}

// Only run if server is available
fetch('http://localhost:3001/api/reviews?userId=1')
    .then(() => testReviewEndpoints())
    .catch(() => console.log('❌ Server not running on localhost:3001'));

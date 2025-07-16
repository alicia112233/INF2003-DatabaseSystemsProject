// Test script to check the reviews API
async function testReviewsAPI() {
  const baseUrl = 'http://localhost:3002';
  
  try {
    console.log('Testing Reviews API...\n');
    
    // Test 1: Get reviews for a game
    console.log('1. Testing GET /api/reviews?gameId=1180030');
    const getResponse = await fetch(`${baseUrl}/api/reviews?gameId=1180030`);
    console.log('Status:', getResponse.status);
    
    if (getResponse.ok) {
      const reviews = await getResponse.json();
      console.log('GET request successful');
      console.log('Reviews found:', reviews.length);
      if (reviews.length > 0) {
        console.log('Sample review:', reviews[0]);
      }
    } else {
      const error = await getResponse.json();
      console.log('GET request failed:', error);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Post a new review (should fail without authentication)
    console.log('2. Testing POST /api/reviews (without authentication)');
    const reviewData = {
      gameId: '1180030',
      rating: 5,
      review: 'Test review without authentication'
    };
    
    const postResponse = await fetch(`${baseUrl}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData)
    });
    
    console.log('Status:', postResponse.status);
    
    if (postResponse.ok) {
      const newReview = await postResponse.json();
      console.log('POST request successful');
      console.log('New review created:', newReview);
    } else {
      const error = await postResponse.json();
      console.log('POST request failed:', error);
    }
    
  } catch (error) {
    console.error('Test failed with error:', error.message);
  }
}

testReviewsAPI();

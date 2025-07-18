const fs = require('fs');

// Read the reviews.json file
const reviews = JSON.parse(fs.readFileSync('backend/data/reviews.json', 'utf8'));

console.log('Original reviews:', reviews.length);

// Remove duplicates based on gameId and userId combination
const uniqueReviews = [];
const seen = new Set();

reviews.forEach((review) => {
    const key = `${review.gameId}-${review.userId}`;
    if (!seen.has(key)) {
        seen.add(key);
        uniqueReviews.push(review);
    }
});

console.log('Unique reviews:', uniqueReviews.length);
console.log('Duplicates removed:', reviews.length - uniqueReviews.length);

// Write the cleaned data back to the file
fs.writeFileSync('backend/data/reviews.json', JSON.stringify(uniqueReviews, null, 2));
console.log('Reviews file updated with unique entries only');

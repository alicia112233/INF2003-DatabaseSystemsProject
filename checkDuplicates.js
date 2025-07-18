const fs = require('fs');

// Read the reviews.json file
const reviews = JSON.parse(fs.readFileSync('backend/data/reviews.json', 'utf8'));

console.log('Total reviews:', reviews.length);

// Check for duplicates
const duplicates = new Map();
const duplicateEntries = [];

reviews.forEach((review, index) => {
    const key = `${review.gameId}-${review.userId}`;
    if (duplicates.has(key)) {
        console.log(`Duplicate found: gameId ${review.gameId}, userId ${review.userId} at index ${index}`);
        duplicateEntries.push(index);
    } else {
        duplicates.set(key, index);
    }
});

console.log('Unique combinations:', duplicates.size);
console.log('Duplicate entries found:', duplicateEntries.length);

// Show some sample data to check data types
console.log('\nSample entries:');
for (let i = 0; i < Math.min(3, reviews.length); i++) {
    console.log(`${i + 1}. gameId: ${reviews[i].gameId} (${typeof reviews[i].gameId}), userId: ${reviews[i].userId} (${typeof reviews[i].userId})`);
}

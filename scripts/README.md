# MongoDB Review Population Script

This script automatically populates your MongoDB database with reviews from `backend/data/reviews.json` when you run the development server.

## How it works

The script runs automatically when you use `npm run dev` as part of the `predev` script, which:
1. Sets up the MySQL database (`setupDb.mjs`)
2. Populates MongoDB with reviews (`populateReviews.mjs`)
3. Starts the Next.js development server

## Available Commands

### Development (with auto-population)
```bash
npm run dev
```
This will:
- Set up MySQL database
- Populate MongoDB with reviews (only if empty)
- Start the development server

### Manual Review Population
```bash
# Populate only if database is empty
npm run populate-reviews

# Force populate (clears existing reviews first)
npm run populate-reviews-force
```

## Script Features

✅ **Smart Population**: Only populates if no reviews exist (prevents duplicates)
✅ **Force Override**: Use `--force` flag to clear and repopulate
✅ **Error Handling**: Detailed error messages and troubleshooting tips
✅ **Data Validation**: Ensures review data format is correct
✅ **Connection Management**: Properly opens and closes MongoDB connections

## File Structure

```
scripts/
  └── populateReviews.mjs     # Main population script
backend/
  └── data/
      └── reviews.json        # Source review data
```

## Review Data Format

The script expects reviews in this format:
```json
[
  {
    "gameId": 1180030,
    "userId": 1,
    "rating": 5,
    "review": "Pretty good, would recommend.",
    "createdAt": "2024-07-19T17:00:11.188986"
  }
]
```

## MongoDB Schema

Reviews are stored with this schema:
```javascript
{
  gameId: String,     // Game ID as string
  userId: String,     // User ID as string  
  rating: Number,     // 1-5 star rating
  review: String,     // Review text
  createdAt: Date     // Creation timestamp
}
```

## Troubleshooting

If you see connection errors:
- Make sure MongoDB is running on your system
- Check that `MONGODB_URI` in `.env` is correct
- Default: `mongodb://localhost:27017/game_haven`

If you see validation errors:
- Check that `reviews.json` has the correct format
- Ensure all required fields are present
- Verify rating values are between 1-5

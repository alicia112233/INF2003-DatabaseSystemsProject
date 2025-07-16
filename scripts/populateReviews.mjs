import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/game_haven';

// Review schema
const reviewSchema = new mongoose.Schema({
  gameId: { type: Number, required: true },
  userId: { type: Number, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

async function populateReviews() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Read reviews.json file
    const reviewsPath = path.join(__dirname, '..', 'backend', 'data', 'reviews.json');
    
    if (!fs.existsSync(reviewsPath)) {
      console.log(' reviews.json file not found at:', reviewsPath);
      return;
    }

    const reviewsData = JSON.parse(fs.readFileSync(reviewsPath, 'utf8'));
    console.log(`Found ${reviewsData.length} reviews to process`);

    // Check if reviews already exist
    const existingCount = await Review.countDocuments();
    
    // Only populate if no reviews exist or if forced
    const forcePopulate = process.argv.includes('--force');
    
    if (existingCount > 0 && !forcePopulate) {
      console.log(`Found ${existingCount} existing reviews in database`);
      console.log('⏭Skipping population (use --force to override)');
      return;
    }

    if (existingCount > 0 && forcePopulate) {
      console.log(`Found ${existingCount} existing reviews in database`);
      console.log('Clearing existing reviews (--force flag detected)...');
      await Review.deleteMany({});
    }

    // Transform and insert reviews
    const transformedReviews = reviewsData.map(review => ({
      gameId: Number(review.gameId),        // Store as number
      userId: Number(review.userId),        // Store as number
      rating: review.rating,
      review: review.review,
      createdAt: new Date(review.createdAt)
    }));

    console.log('Inserting reviews into MongoDB...');
    const result = await Review.insertMany(transformedReviews);
    
    console.log(`Successfully inserted ${result.length} reviews into MongoDB`);
    console.log('Review population completed!');
    
  } catch (error) {
    console.error('Error populating reviews:', error.message);
    
    // More detailed error handling
    if (error.code === 'ECONNREFUSED') {
      console.error('Make sure MongoDB is running on your system');
      console.error('Try: brew services start mongodb/brew/mongodb-community (macOS)');
      console.error('Or: sudo systemctl start mongod (Linux)');
      console.error('Or: net start MongoDB (Windows)');
    } else if (error.name === 'ValidationError') {
      console.error('Data validation error - check your reviews.json format');
    }
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the script
populateReviews();

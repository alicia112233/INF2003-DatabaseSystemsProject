import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from '../src/models/Review'; // no need for .js

dotenv.config();

async function testReviewModel() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is missing");

    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    const newReview = await Review.create({
      gameId: '101',
      userId: 'user123',
      rating: 5,
      review: 'This game is awesome!'
    });

    console.log("Review inserted:", newReview);

    const reviews = await Review.find({ gameId: '101' });
    console.log("Reviews found:", reviews);
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await mongoose.disconnect();
  }
}

testReviewModel();

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/utils/mongodb';
import { isAdmin } from '@/middleware/auth';

// Define the Review schema directly in the API route for testing
const ReviewSchema = new mongoose.Schema({
    gameId: { type: Number, required: true }, 
    userId: { type: Number, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
}, {
    collection: 'reviews'
});

// Create or get the Review model
let Review: mongoose.Model<any>;
try {
  Review = mongoose.model('Review');
} catch {
  Review = mongoose.model('Review', ReviewSchema);
}

// GET all reviews (admin only)
export async function GET(req: NextRequest) {
  try {
    // Check if user is admin
    if (!isAdmin(req)) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Only administrators can access all reviews.'
      }, { status: 403 });
    }

    await dbConnect();
    console.log('Admin fetching all reviews');
    
    // Fetch all reviews sorted by creation date (newest first)
    const reviews = await Review.find({}).sort({ createdAt: -1 });
    console.log(`Found ${reviews.length} total reviews`);
    
    return NextResponse.json(reviews);
  } catch (err) {
    console.error('Error fetching all reviews:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch reviews', details: errorMessage }, { status: 500 });
  }
}

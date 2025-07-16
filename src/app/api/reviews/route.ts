import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/utils/mongodb';
import { getAuthUser, isAuthenticated, isAdmin } from '@/middleware/auth';

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

// GET reviews for a game
export async function GET(req: NextRequest) {
  const gameId = req.nextUrl.searchParams.get('gameId');
  if (!gameId) {
    return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
  }

  try {
    await dbConnect();
    console.log('Fetching reviews for gameId:', gameId);
    console.log('Review model available:', !!Review);
    
    // Convert string gameId to number for MongoDB query
    const gameIdNum = parseInt(gameId);
    if (isNaN(gameIdNum)) {
      return NextResponse.json({ error: 'Invalid gameId format' }, { status: 400 });
    }

    const reviews = await Review.find({ gameId: gameIdNum }).sort({ createdAt: -1 });
    console.log('Found reviews:', reviews.length);
    return NextResponse.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch reviews', details: errorMessage }, { status: 500 });
  }
}

// POST a new review
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'You must be logged in to submit a review. Please log in to continue.'
      }, { status: 401 });
    }

    const data = await req.json();
    const { gameId, rating, review } = data;

    console.log('Received review data from authenticated user:', { 
      gameId, 
      userId: authUser.userId, 
      userRole: authUser.userRole, 
      rating, 
      review 
    });

    // Convert gameId to number for MongoDB
    const gameIdNum = parseInt(gameId);

    // Validate required fields
    if (!gameId || !rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      console.log('Validation failed:', { gameId, userId: authUser.userId, rating, review });
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    if (!review || review.trim().length === 0) {
      return NextResponse.json({ error: 'Review text is required' }, { status: 400 });
    }

    if (isNaN(gameIdNum)) {
      console.log('Invalid gameId conversion:', { gameId, gameIdNum });
      return NextResponse.json({ 
        error: 'Invalid gameId format',
        details: `gameId: ${gameId} (parsed: ${gameIdNum})`
      }, { status: 400 });
    }

    await dbConnect();

    const newReview = await Review.create({
      gameId: gameIdNum,           // Store as number
      userId: authUser.userId,     // Use authenticated user's ID
      rating: Number(rating),
      review: review.trim(),
      createdAt: new Date(),
    });

    console.log('Review created successfully by user:', {
      reviewId: newReview._id,
      userId: authUser.userId,
      userRole: authUser.userRole,
      gameId: gameIdNum
    });
    
    return NextResponse.json(newReview, { status: 201 });
  } catch (err) {
    console.error('Error creating review:', err);
    
    // Handle duplicate review error (unique index violation)
    if (err instanceof Error && err.message.includes('duplicate key error')) {
      return NextResponse.json({ 
        error: 'Duplicate review',
        message: 'You have already reviewed this game. You can only submit one review per game.'
      }, { status: 409 });
    }
    
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to create review', details: errorMessage }, { status: 500 });
  }
}

// PUT to update a review (admin only)
export async function PUT(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'You must be logged in to edit reviews.'
      }, { status: 401 });
    }

    if (!isAdmin(req)) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Only administrators can edit reviews.'
      }, { status: 403 });
    }

    const data = await req.json();
    const { reviewId, rating, review } = data;

    console.log('Admin review update request:', { 
      reviewId, 
      adminUserId: authUser.userId, 
      rating, 
      review 
    });

    // Validate required fields
    if (!reviewId || !rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    if (!review || review.trim().length === 0) {
      return NextResponse.json({ error: 'Review text is required' }, { status: 400 });
    }

    await dbConnect();

    // Find and update the review
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      {
        rating: Number(rating),
        review: review.trim(),
        updatedAt: new Date(), // Add timestamp for when it was last updated
      },
      { new: true } // Return the updated document
    );

    if (!updatedReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    console.log('Review updated successfully by admin:', {
      reviewId: updatedReview._id,
      adminUserId: authUser.userId,
    });
    
    return NextResponse.json(updatedReview, { status: 200 });
  } catch (err) {
    console.error('Error updating review:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to update review', details: errorMessage }, { status: 500 });
  }
}

// DELETE a review (admin only)
export async function DELETE(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ 
        error: 'Authentication required',
        message: 'You must be logged in to delete reviews.'
      }, { status: 401 });
    }

    if (!isAdmin(req)) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Only administrators can delete reviews.'
      }, { status: 403 });
    }

    const reviewId = req.nextUrl.searchParams.get('reviewId');
    if (!reviewId) {
      return NextResponse.json({ error: 'Missing reviewId' }, { status: 400 });
    }

    console.log('Admin review deletion request:', { 
      reviewId, 
      adminUserId: authUser.userId 
    });

    await dbConnect();

    // Find and delete the review
    const deletedReview = await Review.findByIdAndDelete(reviewId);

    if (!deletedReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    console.log('Review deleted successfully by admin:', {
      reviewId: deletedReview._id,
      adminUserId: authUser.userId,
    });
    
    return NextResponse.json({ 
      message: 'Review deleted successfully',
      deletedReview: deletedReview
    }, { status: 200 });
  } catch (err) {
    console.error('Error deleting review:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to delete review', details: errorMessage }, { status: 500 });
  }
}

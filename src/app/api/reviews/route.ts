import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Review from '@/models/Review'; // Use default import, no curly braces

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
}

// GET reviews for a game
export async function GET(req: NextRequest) {
  const gameId = req.nextUrl.searchParams.get('gameId');
  if (!gameId) {
    return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
  }

  try {
    await connectDB();
    const reviews = await Review.find({ gameId });
    return NextResponse.json(reviews);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST a new review
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { gameId, userId, rating, review } = data;

    // Validate required fields
    if (!gameId || !userId || !rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    await connectDB();

    const newReview = await Review.create({
      gameId,
      userId,
      rating,
      review,
      createdAt: new Date(),
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

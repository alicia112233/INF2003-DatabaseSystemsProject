import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/mongodb';
import Review from '@/models/Review';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get('gameId');

  if (!gameId) {
    return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
  }

  const reviews = await Review.find({ gameId }).sort({ createdAt: -1 });
  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const { gameId, userId, rating, review } = await req.json();

  if (!gameId || !userId || typeof rating !== 'number') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const newReview = await Review.create({
    gameId,
    userId,
    rating,
    review,
    createdAt: new Date()
  });

  return NextResponse.json(newReview, { status: 201 });
}

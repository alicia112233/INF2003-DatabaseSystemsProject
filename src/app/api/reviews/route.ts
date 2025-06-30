import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/mongodb';
import Review from '@/models/Review';

// GET: /api/reviews?gameId=xxx
export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get('gameId');
  let filter = {};
  if (gameId) filter = { gameId };
  const reviews = await Review.find(filter).sort({ createdAt: -1 });
  return NextResponse.json(reviews);
}

// POST: /api/reviews
export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  const review = await Review.create(data);
  return NextResponse.json(review, { status: 201 });
}

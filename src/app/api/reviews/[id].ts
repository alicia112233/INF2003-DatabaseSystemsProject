import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/mongodb';
import Review from '@/models/Review';

// GET /api/reviews/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const review = await Review.findById(params.id);
  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(review);
}

// PUT /api/reviews/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const data = await req.json();
  const review = await Review.findByIdAndUpdate(params.id, data, { new: true });
  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(review);
}

// DELETE /api/reviews/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const review = await Review.findByIdAndDelete(params.id);
  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}

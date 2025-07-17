import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/mongodb';
import Review from '@/models/Review';
import { cookies } from 'next/headers';
import { requireAuth } from '@/utils/auth';

// GET: /api/reviews?gameId=xxx&userId=xxx&page=1&limit=10&all=true
export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const gameId = searchParams.get('gameId');
        const userId = searchParams.get('userId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const showAll = searchParams.get('all') === 'true';
        
        let filter: any = {};
        if (gameId) filter.gameId = gameId;
        if (userId) filter.userId = userId;
        
        if (showAll) {
            // Return paginated results when fetching all reviews
            const skip = (page - 1) * limit;
            
            const [reviews, total] = await Promise.all([
                Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
                Review.countDocuments(filter)
            ]);
            
            return NextResponse.json({
                reviews,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } else {
            // Return all reviews without pagination for specific game/user queries
            const reviews = await Review.find(filter).sort({ createdAt: -1 });
            return NextResponse.json(reviews);
        }
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

// POST: /api/reviews
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        
        // Require authentication
        const auth = await requireAuth();
        if (!auth.isAuthenticated) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }
        
        const data = await req.json();
        const { gameId, rating, comment } = data;
        
        // Validate required fields
        if (!gameId || !rating) {
            return NextResponse.json({ error: 'Game ID and rating are required' }, { status: 400 });
        }
        
        // Validate rating range
        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
        }
        
        // Check if user already reviewed this game
        const existingReview = await Review.findOne({ userId: auth.userId, gameId });
        if (existingReview) {
            return NextResponse.json({ error: 'You have already reviewed this game' }, { status: 400 });
        }
        
        const review = await Review.create({
            userId: auth.userId,
            gameId,
            rating,
            comment: comment || '',
            createdAt: new Date()
        });
        
        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        console.error('Error creating review:', error);
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }
}
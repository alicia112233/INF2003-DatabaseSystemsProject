import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/mongodb';
import Review from '@/models/Review';
import { executeQuery } from '@/lib/database';
import { cookies } from 'next/headers';
import { requireAdmin } from '@/utils/auth';

// GET: /api/admin/reviews - Get all reviews with user and game information
export async function GET(req: NextRequest) {
    try {
        // Require admin authentication
        const auth = await requireAdmin();
        
        await dbConnect();
        
        const { searchParams } = new URL(req.url);
        const gameId = searchParams.get('gameId');
        const userId = searchParams.get('userId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        
        let filter: any = {};
        if (gameId) filter.gameId = gameId;
        if (userId) filter.userId = userId;
        
        const skip = (page - 1) * limit;
        
        const [reviews, total] = await Promise.all([
            Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Review.countDocuments(filter)
        ]);
        
        // Get user and game information for each review
        const reviewsWithDetails = await Promise.all(
            reviews.map(async (review) => {
                const reviewObj = review.toObject();
                
                // Get user information
                try {
                    const users = await executeQuery(
                        'SELECT id, firstName, lastName, email FROM users WHERE id = ?',
                        [review.userId]
                    );
                    reviewObj.user = (users as any[])[0] || null;
                } catch (error) {
                    console.error('Error fetching user:', error);
                    reviewObj.user = null;
                }
                
                // Get game information
                try {
                    const games = await executeQuery(
                        'SELECT id, title, image_url FROM Game WHERE id = ?',
                        [review.gameId]
                    );
                    reviewObj.game = (games as any[])[0] || null;
                } catch (error) {
                    console.error('Error fetching game:', error);
                    reviewObj.game = null;
                }
                
                return reviewObj;
            })
        );
        
        return NextResponse.json({
            reviews: reviewsWithDetails,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        if (error instanceof Error && (error.message === 'Authentication required' || error.message === 'Admin access required')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

// DELETE: /api/admin/reviews - Bulk delete reviews
export async function DELETE(req: NextRequest) {
    try {
        // Require admin authentication
        const auth = await requireAdmin();
        
        await dbConnect();
        
        const { reviewIds } = await req.json();
        
        if (!reviewIds || !Array.isArray(reviewIds)) {
            return NextResponse.json({ error: 'Invalid review IDs' }, { status: 400 });
        }
        
        const result = await Review.deleteMany({ _id: { $in: reviewIds } });
        
        return NextResponse.json({
            success: true,
            message: `${result.deletedCount} reviews deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting reviews:', error);
        if (error instanceof Error && (error.message === 'Authentication required' || error.message === 'Admin access required')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        return NextResponse.json({ error: 'Failed to delete reviews' }, { status: 500 });
    }
}

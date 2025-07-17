import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/utils/mongodb';
import Review from '@/models/Review';
import { cookies } from 'next/headers';
import { requireAuth, canModifyReview } from '@/utils/auth';

// GET /api/reviews/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const review = await Review.findById(id);
        if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        return NextResponse.json(review);
    } catch (error) {
        console.error('Error fetching review:', error);
        return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 });
    }
}

// PUT /api/reviews/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const data = await req.json();
        
        // Require authentication
        const auth = await requireAuth();
        if (!auth.isAuthenticated) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }
        
        // Validate rating if provided
        if (data.rating && (data.rating < 1 || data.rating > 5)) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
        }
        
        // Find the review first
        const existingReview = await Review.findById(id);
        if (!existingReview) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }
        
        // Check if user owns the review or is admin
        if (!canModifyReview(existingReview.userId, auth.userId!, auth.userRole)) {
            return NextResponse.json({ error: 'Unauthorized to edit this review' }, { status: 403 });
        }
        
        const review = await Review.findByIdAndUpdate(id, {
            ...data,
            updatedAt: new Date()
        }, { new: true });
        
        return NextResponse.json(review);
    } catch (error) {
        console.error('Error updating review:', error);
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }
}

// DELETE /api/reviews/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        
        // Require authentication
        const auth = await requireAuth();
        if (!auth.isAuthenticated) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }
        
        // Find the review first
        const existingReview = await Review.findById(id);
        if (!existingReview) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }
        
        // Check if user owns the review or is admin
        if (!canModifyReview(existingReview.userId, auth.userId!, auth.userRole)) {
            return NextResponse.json({ error: 'Unauthorized to delete this review' }, { status: 403 });
        }
        
        await Review.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }
}

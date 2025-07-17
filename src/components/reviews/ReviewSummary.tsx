'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Rating, Chip } from '@mui/material';

interface ReviewSummaryProps {
    gameId: string;
    showCount?: boolean;
}

interface ReviewSummary {
    averageRating: number;
    totalReviews: number;
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({ gameId, showCount = true }) => {
    const [summary, setSummary] = useState<ReviewSummary>({ averageRating: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviewSummary();
    }, [gameId]);

    const fetchReviewSummary = async () => {
        try {
            const response = await fetch(`/api/reviews?gameId=${gameId}`);
            const data = await response.json();

            if (response.ok && data.length > 0) {
                const totalReviews = data.length;
                const averageRating = data.reduce((acc: number, review: any) => acc + review.rating, 0) / totalReviews;
                setSummary({ averageRating, totalReviews });
            } else {
                setSummary({ averageRating: 0, totalReviews: 0 });
            }
        } catch (error) {
            console.error('Error fetching review summary:', error);
            setSummary({ averageRating: 0, totalReviews: 0 });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;

    if (summary.totalReviews === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                No reviews yet
            </Typography>
        );
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating value={summary.averageRating} readOnly size="small" precision={0.1} />
            <Typography variant="body2" color="text.secondary">
                {summary.averageRating.toFixed(1)}
            </Typography>
            {showCount && (
                <Typography variant="body2" color="text.secondary">
                    ({summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''})
                </Typography>
            )}
        </Box>
    );
};

export default ReviewSummary;

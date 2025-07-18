'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    Rating,
    Avatar,
    Divider,
    Pagination,
    Alert,
    Snackbar,
    Paper,
    Chip,
    Stack
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface Game {
    id: string;
    title: string;
    image_url?: string;
}

interface Review {
    _id: string;
    userId: number;
    gameId: number;
    rating: number;
    review: string;
    createdAt: string;
    updatedAt: string;
    user?: User;
    game?: Game;
}

interface ReviewComponentProps {
    gameId: string;
    gameTitle?: string;
}

const ReviewComponent: React.FC<ReviewComponentProps> = ({ gameId, gameTitle }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editReview, setEditReview] = useState<Review | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [userReview, setUserReview] = useState<Review | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    
    const [form, setForm] = useState({
        rating: 1,
        review: ''
    });

    const reviewsPerPage = 5;

    useEffect(() => {
        // Check if user is logged in
        const userId = getCookie('userId');
        const userEmail = getCookie('userEmail');
        const isLoggedInCookie = getCookie('isLoggedIn');
        
        const loggedIn = !!(userId && userEmail && isLoggedInCookie === 'true');
        setIsLoggedIn(loggedIn);
        setCurrentUserId(userId);
        
        fetchReviews();
    }, [gameId, currentPage]);

    // Add an effect to listen for storage changes (for cross-tab logout)
    useEffect(() => {
        const handleStorageChange = () => {
            const userId = getCookie('userId');
            const userEmail = getCookie('userEmail');
            const isLoggedInCookie = getCookie('isLoggedIn');
            
            const loggedIn = !!(userId && userEmail && isLoggedInCookie === 'true');
            setIsLoggedIn(loggedIn);
            setCurrentUserId(userId);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const getCookie = (name: string): string | null => {
        if (typeof window === 'undefined') return null;
        
        try {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) {
                const cookieValue = parts.pop()?.split(';').shift();
                return cookieValue ? decodeURIComponent(cookieValue) : null;
            }
        } catch (error) {
            console.error('Error reading cookie:', error);
        }
        return null;
    };

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/reviews?gameId=${gameId}`);
            const data = await response.json();

            if (response.ok) {
                setReviews(data);
                setTotalPages(Math.ceil(data.length / reviewsPerPage));
                
                // Find user's review if logged in
                if (currentUserId) {
                    const userReviewFound = data.find((review: Review) => review.userId.toString() === currentUserId);
                    setUserReview(userReviewFound || null);
                }
            } else {
                setSnackbar({ open: true, message: data.error || 'Failed to fetch reviews', severity: 'error' });
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setSnackbar({ open: true, message: 'Failed to fetch reviews', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!isLoggedIn) {
            setSnackbar({ open: true, message: 'Please log in to write a review', severity: 'error' });
            return;
        }

        try {
            const url = editReview ? `/api/reviews/${editReview._id}` : '/api/reviews';
            const method = editReview ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameId,
                    rating: form.rating,
                    review: form.review
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSnackbar({ 
                    open: true, 
                    message: editReview ? 'Review updated successfully' : 'Review submitted successfully', 
                    severity: 'success' 
                });
                setOpen(false);
                setEditReview(null);
                resetForm();
                fetchReviews();
            } else {
                setSnackbar({ open: true, message: data.error || 'Failed to submit review', severity: 'error' });
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            setSnackbar({ open: true, message: 'Failed to submit review', severity: 'error' });
        }
    };

    const handleEdit = (review: Review) => {
        setEditReview(review);
        setForm({
            rating: review.rating,
            review: review.review
        });
        setOpen(true);
    };

    const resetForm = () => {
        setForm({
            rating: 1,
            review: ''
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getAverageRating = () => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return sum / reviews.length;
    };

    const getRatingDistribution = () => {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(review => {
            distribution[review.rating as keyof typeof distribution]++;
        });
        return distribution;
    };

    const currentReviews = reviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage);

    return (
        <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Reviews {gameTitle && `for ${gameTitle}`}
                </Typography>
                
                {reviews.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating value={getAverageRating()} readOnly precision={0.1} />
                            <Typography variant="body1" fontWeight="medium">
                                {getAverageRating().toFixed(1)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* Review Distribution */}
                {reviews.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Rating Distribution
                        </Typography>
                        <Stack spacing={1}>
                            {[5, 4, 3, 2, 1].map(rating => {
                                const count = getRatingDistribution()[rating as keyof ReturnType<typeof getRatingDistribution>];
                                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                return (
                                    <Box key={rating} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ minWidth: 50 }}>
                                            {rating} star{rating !== 1 ? 's' : ''}
                                        </Typography>
                                        <Box sx={{ flexGrow: 1, height: 8, backgroundColor: '#f0f0f0', borderRadius: 1 }}>
                                            <Box
                                                sx={{
                                                    height: '100%',
                                                    backgroundColor: '#ffc107',
                                                    borderRadius: 1,
                                                    width: `${percentage}%`,
                                                    transition: 'width 0.3s ease'
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="body2" sx={{ minWidth: 30 }}>
                                            {count}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Box>
                )}

                {/* Write Review Button */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    {isLoggedIn ? (
                        userReview ? (
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                onClick={() => handleEdit(userReview)}
                            >
                                Edit Your Review
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setOpen(true)}
                            >
                                Write a Review
                            </Button>
                        )
                    ) : (
                        <Alert severity="info">
                            Please log in to write a review
                        </Alert>
                    )}
                </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Reviews List */}
            <Box sx={{ mb: 3 }}>
                {loading ? (
                    <Typography>Loading reviews...</Typography>
                ) : reviews.length === 0 ? (
                    <Typography color="text.secondary" align="center">
                        No reviews yet. Be the first to review this game!
                    </Typography>
                ) : (
                    <Box>
                        {currentReviews.map((review) => (
                            <Card key={review._id} sx={{ mb: 2 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ width: 40, height: 40 }}>
                                                {review.user?.firstName?.[0] || review.userId.toString().substring(0, 1).toUpperCase()}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="medium">
                                                    {review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Anonymous'}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Rating value={review.rating} readOnly size="small" />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {formatDate(review.createdAt)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                        {review.userId.toString() === currentUserId && (
                                            <Chip
                                                label="Your Review"
                                                color="primary"
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                    </Box>
                                    
                                    {review.review && (
                                        <Typography variant="body1">
                                            {review.review}
                                        </Typography>
                                    )}
                                    
                                    {review.updatedAt !== review.createdAt && (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                            Updated: {formatDate(review.updatedAt)}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                        
                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={(_, page) => setCurrentPage(page)}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </Box>
                )}
            </Box>

            {/* Write/Edit Review Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editReview ? 'Edit Your Review' : 'Write a Review'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Box>
                            <Typography variant="body2" gutterBottom>
                                Rating *
                            </Typography>
                            <Rating
                                value={form.rating}
                                onChange={(_, newValue) => setForm(prev => ({ ...prev, rating: newValue || 1 }))}
                                size="large"
                            />
                        </Box>
                        <TextField
                            fullWidth
                            label="Your Review"
                            multiline
                            rows={4}
                            value={form.review}
                            onChange={(e) => setForm(prev => ({ ...prev, review: e.target.value }))}
                            placeholder="Share your thoughts about this game..."
                            inputProps={{ maxLength: 1000 }}
                            helperText={`${form.review.length}/1000 characters`}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editReview ? 'Update Review' : 'Submit Review'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default ReviewComponent;

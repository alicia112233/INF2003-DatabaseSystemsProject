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
    Pagination,
    Alert,
    Snackbar,
    Container,
    Chip,
    CircularProgress
} from '@mui/material';
import { Edit as EditIcon, Star as StarIcon } from '@mui/icons-material';
import Layout from '@/components/layout';

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
    userId: string;
    gameId: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
    user?: User;
    game?: Game;
}

const MyReviews = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editReview, setEditReview] = useState<Review | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    
    const [form, setForm] = useState({
        rating: 1,
        comment: ''
    });

    const reviewsPerPage = 6;

    useEffect(() => {
        // Check if user is logged in
        const userId = getCookie('userId');
        const userEmail = getCookie('userEmail');
        if (userId && userEmail) {
            setIsLoggedIn(true);
            setCurrentUserId(userId);
            fetchMyReviews(userId);
        } else {
            setIsLoggedIn(false);
            setLoading(false);
        }
    }, []);

    const getCookie = (name: string): string | null => {
        if (typeof window === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
    };

    const fetchMyReviews = async (userId: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/reviews?userId=${userId}`);
            const data = await response.json();

            if (response.ok) {
                setReviews(data);
                setTotalPages(Math.ceil(data.length / reviewsPerPage));
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

    const handleEdit = (review: Review) => {
        setEditReview(review);
        setForm({
            rating: review.rating,
            comment: review.comment
        });
        setOpen(true);
    };

    const handleSubmit = async () => {
        if (!editReview) return;

        try {
            const response = await fetch(`/api/reviews/${editReview._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (response.ok) {
                setSnackbar({ open: true, message: 'Review updated successfully', severity: 'success' });
                setOpen(false);
                setEditReview(null);
                resetForm();
                if (currentUserId) {
                    fetchMyReviews(currentUserId);
                }
            } else {
                setSnackbar({ open: true, message: data.error || 'Failed to update review', severity: 'error' });
            }
        } catch (error) {
            console.error('Error updating review:', error);
            setSnackbar({ open: true, message: 'Failed to update review', severity: 'error' });
        }
    };

    const resetForm = () => {
        setForm({
            rating: 1,
            comment: ''
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const currentReviews = reviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage);

    if (!isLoggedIn) {
        return (
            <Layout>
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Box sx={{ textAlign: 'center', mt: 6 }}>
                        <Alert severity="info">
                            Please log in to view your reviews.
                        </Alert>
                    </Box>
                </Container>
            </Layout>
        );
    }

    return (
        <Layout>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        My Reviews
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage and edit your game reviews
                    </Typography>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : reviews.length === 0 ? (
                    <Box sx={{ textAlign: 'center', mt: 6 }}>
                        <StarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No reviews yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Start reviewing games you&apos;ve played!
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Box 
                            display="grid" 
                            gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }} 
                            gap={3}
                        >
                            {currentReviews.map((review) => (
                                <Card key={review._id} sx={{ height: '100%' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            {review.game?.image_url && (
                                                <Avatar
                                                    src={review.game.image_url}
                                                    sx={{ width: 48, height: 48 }}
                                                    variant="rounded"
                                                />
                                            )}
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="h6" noWrap>
                                                    {review.game?.title || 'Unknown Game'}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Rating value={review.rating} readOnly size="small" />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {review.rating}/5
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                        
                                        {review.comment && (
                                            <Typography variant="body2" sx={{ mb: 2 }}>
                                                {review.comment}
                                            </Typography>
                                        )}
                                        
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(review.createdAt)}
                                                </Typography>
                                                {review.updatedAt !== review.createdAt && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                        Updated: {formatDate(review.updatedAt)}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Button
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleEdit(review)}
                                            >
                                                Edit
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>

                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={(_, page) => setCurrentPage(page)}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </>
                )}

                {/* Edit Review Dialog */}
                <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Edit Review</DialogTitle>
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
                                value={form.comment}
                                onChange={(e) => setForm(prev => ({ ...prev, comment: e.target.value }))}
                                placeholder="Share your thoughts about this game..."
                                inputProps={{ maxLength: 1000 }}
                                helperText={`${form.comment.length}/1000 characters`}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} variant="contained">
                            Update Review
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
            </Container>
        </Layout>
    );
};

export default MyReviews;

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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Rating,
    Avatar,
    Chip,
    IconButton,
    Pagination,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    Tooltip,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

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

interface ReviewFilters {
    gameId: string;
    userId: string;
    rating: string;
    searchTerm: string;
}

const ReviewManagement = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editReview, setEditReview] = useState<Review | null>(null);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<ReviewFilters>({
        gameId: '',
        userId: '',
        rating: '',
        searchTerm: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    
    const [form, setForm] = useState({
        rating: 1,
        review: ''
    });

    useEffect(() => {
        fetchReviews();
    }, [currentPage, filters]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(filters.gameId && { gameId: filters.gameId }),
                ...(filters.userId && { userId: filters.userId }),
            });

            const response = await fetch(`/api/admin/reviews?${params}`);
            const data = await response.json();

            if (response.ok) {
                let filteredReviews = data.reviews;

                // Apply client-side filtering
                if (filters.rating) {
                    filteredReviews = filteredReviews.filter((review: Review) => 
                        review.rating === parseInt(filters.rating)
                    );
                }

                if (filters.searchTerm) {
                    filteredReviews = filteredReviews.filter((review: Review) =>
                        review.review.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                        review.user?.firstName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                        review.user?.lastName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                        review.game?.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
                    );
                }

                setReviews(filteredReviews);
                setTotalPages(data.pagination.pages);
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
            review: review.review
        });
        setOpen(true);
    };

    const handleView = (review: Review) => {
        setSelectedReview(review);
        setViewDialogOpen(true);
    };

    const handleDelete = (reviewId: string) => {
        setSelectedReviews([reviewId]);
        setDeleteDialogOpen(true);
    };

    const handleBulkDelete = () => {
        if (selectedReviews.length > 0) {
            setDeleteDialogOpen(true);
        }
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch('/api/admin/reviews', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewIds: selectedReviews })
            });

            const data = await response.json();

            if (response.ok) {
                setSnackbar({ open: true, message: data.message, severity: 'success' });
                setSelectedReviews([]);
                fetchReviews();
            } else {
                setSnackbar({ open: true, message: data.error || 'Failed to delete reviews', severity: 'error' });
            }
        } catch (error) {
            console.error('Error deleting reviews:', error);
            setSnackbar({ open: true, message: 'Failed to delete reviews', severity: 'error' });
        } finally {
            setDeleteDialogOpen(false);
        }
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
                fetchReviews();
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
            review: ''
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedReviews(reviews.map(review => review._id));
        } else {
            setSelectedReviews([]);
        }
    };

    const handleSelectReview = (reviewId: string, checked: boolean) => {
        if (checked) {
            setSelectedReviews([...selectedReviews, reviewId]);
        } else {
            setSelectedReviews(selectedReviews.filter(id => id !== reviewId));
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <PageContainer title="Review Management" description="Manage game reviews">
            <DashboardCard title="Review Management">
                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <TextField
                            placeholder="Search reviews..."
                            size="small"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: 300 }}
                        />
                        
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Rating</InputLabel>
                            <Select
                                value={filters.rating}
                                label="Rating"
                                onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="1">1 Star</MenuItem>
                                <MenuItem value="2">2 Stars</MenuItem>
                                <MenuItem value="3">3 Stars</MenuItem>
                                <MenuItem value="4">4 Stars</MenuItem>
                                <MenuItem value="5">5 Stars</MenuItem>
                            </Select>
                        </FormControl>

                        {selectedReviews.length > 0 && (
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={handleBulkDelete}
                            >
                                Delete Selected ({selectedReviews.length})
                            </Button>
                        )}
                    </Box>
                </Box>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedReviews.length === reviews.length && reviews.length > 0}
                                        indeterminate={selectedReviews.length > 0 && selectedReviews.length < reviews.length}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Game</TableCell>
                                <TableCell>Rating</TableCell>
                                                                                <TableCell>Review</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : reviews.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No reviews found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                reviews.map((review) => (
                                    <TableRow key={review._id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedReviews.includes(review._id)}
                                                onChange={(e) => handleSelectReview(review._id, e.target.checked)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ width: 32, height: 32 }}>
                                                    {review.user?.firstName?.[0] || 'U'}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Unknown User'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {review.user?.email || 'No email'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {review.game?.image_url && (
                                                    <Avatar
                                                        src={review.game.image_url}
                                                        sx={{ width: 32, height: 32 }}
                                                        variant="rounded"
                                                    />
                                                )}
                                                <Typography variant="body2">
                                                    {review.game?.title || 'Unknown Game'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Rating value={review.rating} readOnly size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ maxWidth: 200 }}>
                                                {review.review.length > 50 
                                                    ? `${review.review.substring(0, 50)}...`
                                                    : review.review || 'No review'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(review.createdAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title="View">
                                                    <IconButton size="small" onClick={() => handleView(review)}>
                                                        <ViewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton size="small" onClick={() => handleEdit(review)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton size="small" color="error" onClick={() => handleDelete(review._id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

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
            </DashboardCard>

            {/* Edit Review Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Review</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <Box>
                            <Typography variant="body2" gutterBottom>Rating</Typography>
                            <Rating
                                value={form.rating}
                                onChange={(_, newValue) => setForm(prev => ({ ...prev, rating: newValue || 1 }))}
                                size="large"
                            />
                        </Box>
                        <TextField
                            fullWidth
                            label="Review"
                            multiline
                            rows={4}
                            value={form.review}
                            onChange={(e) => setForm(prev => ({ ...prev, review: e.target.value }))}
                            placeholder="Enter review text..."
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

            {/* View Review Dialog */}
            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Review Details</DialogTitle>
                <DialogContent>
                    {selectedReview && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ width: 48, height: 48 }}>
                                                {selectedReview.user?.firstName?.[0] || 'U'}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6">
                                                    {selectedReview.user ? `${selectedReview.user.firstName} ${selectedReview.user.lastName}` : 'Unknown User'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {selectedReview.user?.email || 'No email'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatDate(selectedReview.createdAt)}
                                            </Typography>
                                            {selectedReview.updatedAt !== selectedReview.createdAt && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Updated: {formatDate(selectedReview.updatedAt)}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        {selectedReview.game?.image_url && (
                                            <Avatar
                                                src={selectedReview.game.image_url}
                                                sx={{ width: 48, height: 48 }}
                                                variant="rounded"
                                            />
                                        )}
                                        <Typography variant="h6">
                                            {selectedReview.game?.title || 'Unknown Game'}
                                        </Typography>
                                    </Box>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" gutterBottom>Rating:</Typography>
                                        <Rating value={selectedReview.rating} readOnly />
                                    </Box>
                                    
                                    <Box>
                                        <Typography variant="body2" gutterBottom>Review:</Typography>
                                        <Typography variant="body1">
                                            {selectedReview.review || 'No review provided'}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete {selectedReviews.length} review(s)? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Delete
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
        </PageContainer>
    );
};

export default ReviewManagement;

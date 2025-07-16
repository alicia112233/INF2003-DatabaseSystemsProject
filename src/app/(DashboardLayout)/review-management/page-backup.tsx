'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Rating,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Slider,
  Skeleton,
  Fade
} from '@mui/material';
import { IconEdit, IconTrash, IconDeviceGamepad, IconUser, IconSearch, IconFilter, IconCalendar, IconStar } from '@tabler/icons-react';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Utility function to highlight search terms
const highlightText = (text: string, searchTerm: string) => {
  if (!searchTerm.trim()) return text;
  
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} style={{ backgroundColor: '#ffeb3b', padding: '0 2px' }}>
        {part}
      </mark>
    ) : (
      part
    )
  );
};

interface Review {
  _id: string;
  gameId: number;
  userId: number;
  rating: number;
  review: string;
  createdAt: string;
  updatedAt?: string;
}

export default function ReviewManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]); // Store all reviews for filtering
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editReviewText, setEditReviewText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  // Enhanced filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'gameId', 'userId', 'rating', 'date'
  const [gameIdFilter, setGameIdFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  
  // New advanced filters
  const [ratingRange, setRatingRange] = useState<number[]>([1, 5]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const reviewsPerPage = 10;

  // Fetch all reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reviews/all');
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const reviewsData = await response.json();
      
      setAllReviews(reviewsData);
      setFilteredReviews(reviewsData);
      
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced apply filters function
  const applyFilters = useCallback(() => {
    setFilterLoading(true);
    
    let filtered = [...allReviews];

    // Text search filters
    if (filterType === 'gameId' && gameIdFilter) {
      filtered = filtered.filter(review => 
        review.gameId.toString() === gameIdFilter
      );
    } else if (filterType === 'userId' && userIdFilter) {
      filtered = filtered.filter(review => 
        review.userId.toString() === userIdFilter
      );
    } else if (filterType === 'all' && debouncedSearchTerm) {
      // Search across all fields
      filtered = filtered.filter(review => 
        review.gameId.toString().includes(debouncedSearchTerm) ||
        review.userId.toString().includes(debouncedSearchTerm) ||
        review.review.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    // Rating range filter
    filtered = filtered.filter(review => 
      review.rating >= ratingRange[0] && review.rating <= ratingRange[1]
    );

    // Date range filter
    if (dateRange.startDate) {
      const startDate = new Date(dateRange.startDate);
      filtered = filtered.filter(review => 
        new Date(review.createdAt) >= startDate
      );
    }
    
    if (dateRange.endDate) {
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(review => 
        new Date(review.createdAt) <= endDate
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'gameId':
          aValue = a.gameId;
          bValue = b.gameId;
          break;
        case 'userId':
          aValue = a.userId;
          bValue = b.userId;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredReviews(filtered);
    setPage(1); // Reset to first page when filtering
    
    setTimeout(() => setFilterLoading(false), 200); // Small delay for better UX
  }, [allReviews, filterType, gameIdFilter, userIdFilter, debouncedSearchTerm, ratingRange, dateRange, sortBy, sortOrder]);

  // Update pagination based on filtered results
  useEffect(() => {
    const startIndex = (page - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);
    
    setReviews(paginatedReviews);
    setTotalPages(Math.ceil(filteredReviews.length / reviewsPerPage));
  }, [filteredReviews, page]);

  // Apply filters when filter values change
  useEffect(() => {
    if (allReviews.length > 0) {
      applyFilters();
    }
  }, [applyFilters, allReviews]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleEditClick = (review: Review) => {
    setSelectedReview(review);
    setEditRating(review.rating);
    setEditReviewText(review.review);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (review: Review) => {
    setSelectedReview(review);
    setDeleteDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedReview) return;
    
    setActionLoading(true);
    setError('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: selectedReview._id,
          rating: editRating,
          review: editReviewText
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update review');
      }

      setSuccess('Review updated successfully');
      setEditDialogOpen(false);
      fetchReviews(); // Refresh the reviews
      
    } catch (err) {
      console.error('Error updating review:', err);
      setError(err instanceof Error ? err.message : 'Failed to update review');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReview) return;
    
    setActionLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/reviews?reviewId=${selectedReview._id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete review');
      }

      setSuccess('Review deleted successfully');
      setDeleteDialogOpen(false);
      fetchReviews(); // Refresh the reviews
      
    } catch (err) {
      console.error('Error deleting review:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <PageContainer title="Review Management | Admin | Game Haven" description="Manage user reviews">
      <Box>
        <Typography variant="h4" mb={3}>
          Review Management
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>
              All User Reviews
            </Typography>

            {/* Enhanced Filter Section */}
            <Card variant="outlined" sx={{ mb: 3, bgcolor: 'grey.50' }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                  <IconFilter size={20} />
                  <Typography variant="h6">
                    Advanced Search & Filter
                  </Typography>
                  {filterLoading && <CircularProgress size={16} />}
                </Box>

                {/* Primary Filters Row */}
                <Grid container spacing={2} alignItems="center" mb={3}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Filter Type</InputLabel>
                      <Select
                        value={filterType}
                        label="Filter Type"
                        onChange={(e) => {
                          setFilterType(e.target.value);
                          // Reset specific filters when changing type
                          setSearchTerm('');
                          setGameIdFilter('');
                          setUserIdFilter('');
                        }}
                      >
                        <MenuItem value="all">All Fields</MenuItem>
                        <MenuItem value="gameId">Game ID</MenuItem>
                        <MenuItem value="userId">User ID</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Search Field with debouncing */}
                  {filterType === 'all' && (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Search all fields..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: <IconSearch size={18} style={{ marginRight: 8 }} />
                        }}
                        helperText="Search is debounced - results appear after you stop typing"
                      />
                    </Grid>
                  )}

                  {/* Game ID Filter */}
                  {filterType === 'gameId' && (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Game ID"
                        type="number"
                        value={gameIdFilter}
                        onChange={(e) => setGameIdFilter(e.target.value)}
                      />
                    </Grid>
                  )}

                  {/* User ID Filter */}
                  {filterType === 'userId' && (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="User ID"
                        type="number"
                        value={userIdFilter}
                        onChange={(e) => setUserIdFilter(e.target.value)}
                      />
                    </Grid>
                  )}

                  {/* Sort Controls */}
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={sortBy}
                        label="Sort By"
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <MenuItem value="createdAt">Date Created</MenuItem>
                        <MenuItem value="rating">Rating</MenuItem>
                        <MenuItem value="gameId">Game ID</MenuItem>
                        <MenuItem value="userId">User ID</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Order</InputLabel>
                      <Select
                        value={sortOrder}
                        label="Order"
                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                      >
                        <MenuItem value="desc">Descending</MenuItem>
                        <MenuItem value="asc">Ascending</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Advanced Filters Row */}
                <Grid container spacing={3} alignItems="center" mb={3}>
                  {/* Rating Range Filter */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <IconStar size={16} />
                        <Typography variant="body2" fontWeight="medium">
                          Rating Range: {ratingRange[0]} - {ratingRange[1]} stars
                        </Typography>
                      </Box>
                      <Slider
                        value={ratingRange}
                        onChange={(_, newValue) => setRatingRange(newValue as number[])}
                        valueLabelDisplay="auto"
                        min={1}
                        max={5}
                        step={1}
                        marks={[
                          { value: 1, label: '1★' },
                          { value: 2, label: '2★' },
                          { value: 3, label: '3★' },
                          { value: 4, label: '4★' },
                          { value: 5, label: '5★' }
                        ]}
                      />
                    </Box>
                  </Grid>

                  {/* Date Range Filter */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <IconCalendar size={16} />
                        <Typography variant="body2" fontWeight="medium">
                          Date Range
                        </Typography>
                      </Box>
                      <Box display="flex" gap={1}>
                        <TextField
                          size="small"
                          label="From"
                          type="date"
                          value={dateRange.startDate}
                          onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          size="small"
                          label="To"
                          type="date"
                          value={dateRange.endDate}
                          onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                          InputLabelProps={{ shrink: true }}
                          sx={{ flex: 1 }}
                        />
                      </Box>
                    </Box>
                  </Grid>

                  {/* Clear Filters Button */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        setFilterType('all');
                        setSearchTerm('');
                        setGameIdFilter('');
                        setUserIdFilter('');
                        setRatingRange([1, 5]);
                        setDateRange({ startDate: '', endDate: '' });
                        setSortBy('createdAt');
                        setSortOrder('desc');
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </Grid>
                </Grid>

                {/* Results Summary with better visual feedback */}
                <Box 
                  p={2} 
                  bgcolor="rgba(25, 118, 210, 0.08)" 
                  borderRadius={1}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2" color="text.secondary">
                    <strong>Showing {reviews.length}</strong> of <strong>{filteredReviews.length}</strong> reviews
                    {filteredReviews.length !== allReviews.length && 
                      ` (filtered from ${allReviews.length} total)`
                    }
                  </Typography>
                  
                  {filteredReviews.length === 0 && allReviews.length > 0 && (
                    <Chip 
                      label="No matches" 
                      color="warning" 
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>
            
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                {filterLoading ? (
                  <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary">
                      Applying filters...
                    </Typography>
                  </Box>
                ) : (
                  <CircularProgress />
                )}
              </Box>
            ) : reviews.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography variant="h6" color="text.secondary" mb={2}>
                  {filteredReviews.length === 0 && allReviews.length > 0 
                    ? "No reviews match your filters" 
                    : "No reviews found"
                  }
                </Typography>
                {filteredReviews.length === 0 && allReviews.length > 0 && (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Try adjusting your search criteria or clearing filters
                  </Typography>
                )}
              </Box>
            ) : (
              <Fade in={!filterLoading}>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Game ID</TableCell>
                        <TableCell>Rating</TableCell>
                        <TableCell>Review</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reviews.map((review) => (
                        <TableRow key={review._id} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <IconUser size={16} />
                              User {review.userId}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <IconDeviceGamepad size={16} />
                              {review.gameId}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Rating value={review.rating} readOnly size="small" />
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                maxWidth: 200, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              "{highlightText(review.review, debouncedSearchTerm)}"
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(review.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {review.updatedAt ? (
                              <Chip 
                                label="Edited" 
                                color="warning" 
                                size="small"
                                title={`Updated: ${formatDate(review.updatedAt)}`}
                              />
                            ) : (
                              <Chip label="Original" color="default" size="small" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <IconButton 
                                size="small" 
                                onClick={() => handleEditClick(review)}
                                color="primary"
                              >
                                <IconEdit size={16} />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteClick(review)}
                                color="error"
                              >
                                <IconTrash size={16} />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Fade>
            )}

            {/* Pagination */}
            {!loading && reviews.length > 0 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
                        <TableCell>Game ID</TableCell>
                        <TableCell>Rating</TableCell>
                        <TableCell>Review</TableCell>
                        <TableCell>Created</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reviews.map((review) => (
                        <TableRow key={review._id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <IconUser size={16} />
                              User {review.userId}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <IconDeviceGamepad size={16} />
                              {review.gameId}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Rating value={review.rating} readOnly size="small" />
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                maxWidth: 200, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              "{review.review}"
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(review.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {review.updatedAt ? (
                              <Chip 
                                label="Edited" 
                                color="warning" 
                                size="small"
                                title={`Updated: ${formatDate(review.updatedAt)}`}
                              />
                            ) : (
                              <Chip label="Original" color="default" size="small" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleEditClick(review)}
                                title="Edit review"
                              >
                                <IconEdit size={16} />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteClick(review)}
                                title="Delete review"
                              >
                                <IconTrash size={16} />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Fade>
            )}

            {/* Pagination */}
            {!loading && reviews.length > 0 && totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={(_, newPage) => setPage(newPage)}
                  color="primary"
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Review</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" mb={2}>
                User {selectedReview?.userId} • Game {selectedReview?.gameId}
              </Typography>
              
              <Typography variant="body2" mb={1}>Rating:</Typography>
              <Rating 
                value={editRating} 
                onChange={(_, newValue) => setEditRating(newValue || 1)}
                size="large"
                sx={{ mb: 3 }}
              />
              
              <TextField
                label="Review Text"
                multiline
                rows={4}
                fullWidth
                value={editReviewText}
                onChange={(e) => setEditReviewText(e.target.value)}
                variant="outlined"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setEditDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditSave}
              variant="contained"
              disabled={actionLoading || !editReviewText.trim()}
            >
              {actionLoading ? <CircularProgress size={20} /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Delete Review</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this review by User {selectedReview?.userId}? 
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={20} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
}

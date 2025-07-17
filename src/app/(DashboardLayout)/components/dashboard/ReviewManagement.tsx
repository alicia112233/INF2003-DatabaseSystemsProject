import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Button, Chip, CircularProgress } from '@mui/material';
import { IconMessageCircle, IconEdit, IconTrash, IconEye } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  recentReviews: number;
  editedReviews: number;
}

const ReviewManagement = () => {
  const router = useRouter();
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    recentReviews: 0,
    editedReviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewStats();
  }, []);

  const fetchReviewStats = async () => {
    try {
      const response = await fetch('/api/reviews/all');
      if (response.ok) {
        const reviews = await response.json();
        
        // Calculate statistics
        const totalReviews = reviews.length;
        const averageRating = reviews.length > 0 
          ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
          : 0;
        
        // Reviews from last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentReviews = reviews.filter((review: any) => 
          new Date(review.createdAt) > weekAgo
        ).length;
        
        // Edited reviews
        const editedReviews = reviews.filter((review: any) => review.updatedAt).length;
        
        setStats({
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
          recentReviews,
          editedReviews
        });
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllReviews = () => {
    router.push('/review-management');
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <IconMessageCircle size={24} color="#1976d2" />
          <Typography variant="h6" fontWeight="bold">
            Review Management
          </Typography>
        </Box>

        <Box display="flex" flexDirection="column" gap={2} mb={3}>
          {/* Total Reviews */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Total Reviews
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {stats.totalReviews}
            </Typography>
          </Box>

          {/* Average Rating */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Average Rating
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" fontWeight="bold">
                {stats.averageRating}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ★
              </Typography>
            </Box>
          </Box>

          {/* Recent Reviews */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Reviews (Last 7 days)
            </Typography>
            <Chip 
              label={stats.recentReviews} 
              color="success" 
              size="small"
              variant="outlined"
            />
          </Box>

          {/* Edited Reviews */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Edited Reviews
            </Typography>
            <Chip 
              label={stats.editedReviews} 
              color="warning" 
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box display="flex" flexDirection="column" gap={1}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<IconEye />}
            onClick={handleViewAllReviews}
            sx={{ 
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' }
            }}
          >
            View All Reviews
          </Button>
          
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<IconEdit />}
              onClick={handleViewAllReviews}
              sx={{ flex: 1, fontSize: '0.75rem' }}
            >
              Moderate
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<IconTrash />}
              onClick={handleViewAllReviews}
              sx={{ flex: 1, fontSize: '0.75rem' }}
            >
              Cleanup
            </Button>
          </Box>
        </Box>

        {/* Quick Stats Summary */}
        <Box 
          mt={2} 
          p={2} 
          bgcolor="rgba(25, 118, 210, 0.08)" 
          borderRadius={1}
        >
          <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
            {stats.totalReviews > 0 
              ? `${stats.recentReviews} new reviews this week • ${Math.round((stats.editedReviews / stats.totalReviews) * 100)}% edited`
              : 'No reviews yet'
            }
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReviewManagement;

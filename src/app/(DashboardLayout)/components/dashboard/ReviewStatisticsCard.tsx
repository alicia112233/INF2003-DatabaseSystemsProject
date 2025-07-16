'use client';

import React from 'react';
import { Card, CardContent, Typography, Box, Button, Chip } from '@mui/material';
import { IconChartBar, IconStar, IconMessageCircle, IconTrendingUp } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

const ReviewStatisticsCard = () => {
  const router = useRouter();

  const handleViewStatistics = () => {
    router.push('/review-statistics');
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <IconChartBar size={24} color="#1976d2" />
            <Typography variant="h6" ml={1}>
              Review Analytics
            </Typography>
          </Box>
          <Chip 
            label="NEW" 
            size="small" 
            color="primary" 
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        
        <Typography variant="body2" color="textSecondary" mb={3}>
          View comprehensive review statistics, average ratings per game, and detailed analytics.
        </Typography>

        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconStar size={16} color="#ff9800" />
            <Typography variant="caption" color="textSecondary">
              Average Ratings
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <IconMessageCircle size={16} color="#4caf50" />
            <Typography variant="caption" color="textSecondary">
              Review Counts
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <IconTrendingUp size={16} color="#9c27b0" />
            <Typography variant="caption" color="textSecondary">
              Trends
            </Typography>
          </Box>
        </Box>

        <Button 
          variant="contained" 
          fullWidth 
          onClick={handleViewStatistics}
          startIcon={<IconChartBar size={18} />}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0',
            }
          }}
        >
          View Detailed Statistics
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReviewStatisticsCard;

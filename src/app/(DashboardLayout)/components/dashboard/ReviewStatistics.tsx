'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Avatar,
  Rating,
  Button,
  Divider
} from '@mui/material';
import {
  IconStar,
  IconTrendingUp,
  IconUsers,
  IconMessageCircle,
  IconChartBar,
  IconRefresh
} from '@tabler/icons-react';

interface RatingDistribution {
  five: number;
  four: number;
  three: number;
  two: number;
  one: number;
}

interface GameReviewStats {
  id: number;
  title: string;
  image_url?: string;
  price: number;
  reviewStats: {
    totalReviews: number;
    averageRating: number;
    latestReview: string | null;
    oldestReview: string | null;
    ratingDistribution: RatingDistribution;
  };
}

interface OverallStats {
  totalReviews: number;
  averageRating: number;
  totalGamesWithReviews: number;
  recentReviews: number;
}

interface ReviewStatisticsData {
  games: GameReviewStats[];
  overallStats: OverallStats;
}

const ReviewStatistics = () => {
  const [data, setData] = useState<ReviewStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/reviews/statistics');
      if (!response.ok) {
        throw new Error('Failed to fetch review statistics');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#4caf50'; // Green
    if (rating >= 4.0) return '#8bc34a'; // Light green
    if (rating >= 3.5) return '#ffeb3b'; // Yellow
    if (rating >= 3.0) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const getPopularityLevel = (reviewCount: number) => {
    if (reviewCount >= 50) return { label: 'Very Popular', color: '#4caf50' };
    if (reviewCount >= 20) return { label: 'Popular', color: '#8bc34a' };
    if (reviewCount >= 10) return { label: 'Moderate', color: '#ff9800' };
    if (reviewCount >= 5) return { label: 'Low', color: '#ff5722' };
    return { label: 'No Reviews', color: '#9e9e9e' };
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

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography color="error" align="center">
            Error: {error}
          </Typography>
          <Box display="flex" justifyContent="center" mt={2}>
            <Button startIcon={<IconRefresh />} onClick={fetchData}>
              Retry
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const topRatedGames = data.games
    .filter(game => game.reviewStats.totalReviews > 0)
    .sort((a, b) => b.reviewStats.averageRating - a.reviewStats.averageRating)
    .slice(0, 5);

  const mostReviewedGames = data.games
    .filter(game => game.reviewStats.totalReviews > 0)
    .sort((a, b) => b.reviewStats.totalReviews - a.reviewStats.totalReviews)
    .slice(0, 5);

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Review Statistics Dashboard
        </Typography>
        <Button
          startIcon={<IconRefresh />}
          onClick={fetchData}
          variant="outlined"
          size="small"
        >
          Refresh
        </Button>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <IconMessageCircle size={24} color="#1976d2" />
                <Typography variant="h6" ml={1}>
                  Total Reviews
                </Typography>
              </Box>
              <Typography variant="h3" color="primary" fontWeight="bold">
                {data.overallStats.totalReviews}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Across all games
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <IconStar size={24} color="#ff9800" />
                <Typography variant="h6" ml={1}>
                  Average Rating
                </Typography>
              </Box>
              <Typography variant="h3" color="primary" fontWeight="bold">
                {data.overallStats.averageRating.toFixed(2)}
              </Typography>
              <Rating
                value={data.overallStats.averageRating}
                readOnly
                precision={0.1}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <IconChartBar size={24} color="#4caf50" />
                <Typography variant="h6" ml={1}>
                  Games Reviewed
                </Typography>
              </Box>
              <Typography variant="h3" color="primary" fontWeight="bold">
                {data.overallStats.totalGamesWithReviews}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Out of {data.games.length} total games
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <IconTrendingUp size={24} color="#9c27b0" />
                <Typography variant="h6" ml={1}>
                  Recent Reviews
                </Typography>
              </Box>
              <Typography variant="h3" color="primary" fontWeight="bold">
                {data.overallStats.recentReviews}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last 7 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Rated and Most Reviewed Games */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2} display="flex" alignItems="center">
                <IconStar color="#ff9800" size={20} />
                <Box ml={1}>Top Rated Games</Box>
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {topRatedGames.map((game, index) => (
                <Box key={game.id} display="flex" alignItems="center" mb={2}>
                  <Typography variant="h6" color="primary" mr={2} minWidth={30}>
                    #{index + 1}
                  </Typography>
                  <Avatar
                    src={game.image_url}
                    alt={game.title}
                    sx={{ width: 40, height: 40, mr: 2 }}
                  />
                  <Box flex={1}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {game.title}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Rating
                        value={game.reviewStats.averageRating}
                        readOnly
                        precision={0.1}
                        size="small"
                      />
                      <Typography variant="caption" color="textSecondary">
                        ({game.reviewStats.totalReviews} reviews)
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={game.reviewStats.averageRating.toFixed(1)}
                    size="small"
                    sx={{
                      backgroundColor: getRatingColor(game.reviewStats.averageRating),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2} display="flex" alignItems="center">
                <IconUsers color="#1976d2" size={20} />
                <Box ml={1}>Most Reviewed Games</Box>
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {mostReviewedGames.map((game, index) => (
                <Box key={game.id} display="flex" alignItems="center" mb={2}>
                  <Typography variant="h6" color="primary" mr={2} minWidth={30}>
                    #{index + 1}
                  </Typography>
                  <Avatar
                    src={game.image_url}
                    alt={game.title}
                    sx={{ width: 40, height: 40, mr: 2 }}
                  />
                  <Box flex={1}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {game.title}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Rating
                        value={game.reviewStats.averageRating}
                        readOnly
                        precision={0.1}
                        size="small"
                      />
                      <Typography variant="caption" color="textSecondary">
                        ({game.reviewStats.averageRating.toFixed(1)} avg)
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={`${game.reviewStats.totalReviews} reviews`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Games Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>
            All Games Review Statistics
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Game</TableCell>
                  <TableCell align="center">Reviews</TableCell>
                  <TableCell align="center">Avg Rating</TableCell>
                  <TableCell align="center">Rating Distribution</TableCell>
                  <TableCell align="center">Popularity</TableCell>
                  <TableCell align="center">Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.games
                  .sort((a, b) => b.reviewStats.totalReviews - a.reviewStats.totalReviews)
                  .map((game) => {
                    const popularity = getPopularityLevel(game.reviewStats.totalReviews);
                    return (
                      <TableRow key={game.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar
                              src={game.image_url}
                              alt={game.title}
                              sx={{ width: 32, height: 32, mr: 2 }}
                            />
                            <Typography variant="subtitle2">
                              {game.title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="h6" color="primary">
                            {game.reviewStats.totalReviews}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {game.reviewStats.totalReviews > 0 ? (
                            <Box display="flex" flexDirection="column" alignItems="center">
                              <Chip
                                label={game.reviewStats.averageRating.toFixed(1)}
                                size="small"
                                sx={{
                                  backgroundColor: getRatingColor(game.reviewStats.averageRating),
                                  color: 'white',
                                  fontWeight: 'bold',
                                  mb: 0.5
                                }}
                              />
                              <Rating
                                value={game.reviewStats.averageRating}
                                readOnly
                                precision={0.1}
                                size="small"
                              />
                            </Box>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              No reviews
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {game.reviewStats.totalReviews > 0 ? (
                            <Box width={120}>
                              {[5, 4, 3, 2, 1].map((star) => {
                                const count = game.reviewStats.ratingDistribution[
                                  star === 5 ? 'five' :
                                  star === 4 ? 'four' :
                                  star === 3 ? 'three' :
                                  star === 2 ? 'two' : 'one'
                                ];
                                const percentage = (count / game.reviewStats.totalReviews) * 100;
                                return (
                                  <Box key={star} display="flex" alignItems="center" mb={0.5}>
                                    <Typography variant="caption" sx={{ minWidth: 20 }}>
                                      {star}★
                                    </Typography>
                                    <LinearProgress
                                      variant="determinate"
                                      value={percentage}
                                      sx={{ flex: 1, mx: 1, height: 4 }}
                                    />
                                    <Typography variant="caption" sx={{ minWidth: 20 }}>
                                      {count}
                                    </Typography>
                                  </Box>
                                );
                              })}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="textSecondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={popularity.label}
                            size="small"
                            sx={{
                              backgroundColor: popularity.color,
                              color: 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="subtitle2" color="success.main" fontWeight="bold">
                            ${Number(game.price).toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReviewStatistics;

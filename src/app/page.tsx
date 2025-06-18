'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, CardMedia, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import Layout from '@/components/layout';

type Game = {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  price: number;
};

const Recommendations = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/recommendations')
      .then(res => res.json())
      .then(data => {
        setGames(data.recommendations || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <Typography>Loading recommendations...</Typography>;
  if (games.length === 0) return <Typography>No recommendations available.</Typography>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
      {games.map(game => (
        <Card key={game.id} sx={{ width: 340, minHeight: 420, display: 'flex', flexDirection: 'column', boxShadow: 3 }}>
          {game.image_url && (
            <CardMedia
              component="img"
              height="180"
              image={game.image_url}
              alt={game.title}
            />
          )}
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h5" gutterBottom>{game.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
              {game.description ? game.description.slice(0, 100) + (game.description.length > 100 ? '...' : '') : ''}
            </Typography>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              ${game.price}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" color="primary">Add to Cart</Button>
              <Button variant="contained" sx={{ bgcolor: '#B8860B', '&:hover': { bgcolor: '#9A7209' } }}>
                Add to Wishlist
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

// Example MoreGames component (replace with your actual implementation)
const MoreGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  useEffect(() => {
    fetch('/api/games') // Replace with your actual endpoint for all games
      .then(res => res.json())
      .then (data => setGames(data.games || []));
  }, []);
  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>More Games</Typography>
      <Grid container spacing={3}>
        {games.map(game => (
          <Grid item xs={12} sm={6} md={3} key={game.id}>
            <Card sx={{ height: 320, display: 'flex', flexDirection: 'column' }}>
              {game.image_url && (
                <CardMedia
                  component="img"
                  height="140"
                  image={game.image_url}
                  alt={game.title}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent>
                <Typography variant="subtitle1">{game.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  ${game.price}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default function HomePage() {
  return (
    <Layout>
      <PageContainer title="Game Haven" description="Your ultimate gaming destination">
        <DashboardCard title="Featured & Recommended 👍">
          <Recommendations />
        </DashboardCard>
        <MoreGames />
      </PageContainer>
    </Layout>
  );
}
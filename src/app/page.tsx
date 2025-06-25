'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, CardMedia, Stack, IconButton, Grid } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
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

function capitalizeTitle(title: string) {
  return title.replace(/\b\w/g, (c) => c.toUpperCase());
}

const RecommendationsCarousel = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch('/api/recommendations')
      .then(res => res.json())
      .then(data => setGames(data.recommendations || []));
  }, []);

  if (games.length === 0) return <Typography>No recommendations available.</Typography>;

  const game = games[current];

  const handlePrev = () => setCurrent((prev) => (prev === 0 ? games.length - 1 : prev - 1));
  const handleNext = () => setCurrent((prev) => (prev === games.length - 1 ? 0 : prev + 1));

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 350 }}>
      <IconButton onClick={handlePrev}><ArrowBackIosIcon /></IconButton>
      <Card sx={{ width: 500, minHeight: 350, mx: 2, display: 'flex', flexDirection: 'row', boxShadow: 3 }}>
        {game.image_url && (
          <CardMedia
            component="img"
            image={game.image_url}
            alt={game.title}
            sx={{ width: 220, objectFit: 'cover' }}
          />
        )}
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="h5" gutterBottom>
            {capitalizeTitle(game.title)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
            {game.description ? game.description.slice(0, 100) + (game.description.length > 100 ? '...' : '') : ''}
          </Typography>
          <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
            ${game.price}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" color="primary">Add to Cart</Button>
            <Button
  variant="contained"
  sx={{ bgcolor: '#B8860B', '&:hover': { bgcolor: '#9A7209' } }}
  onClick={async () => {
    await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: game.id }),
    });
    // Optional: show a toast/snackbar and/or update UI state
  }}
>
  Add to Wishlist
</Button>

          </Stack>
        </CardContent>
      </Card>
      <IconButton onClick={handleNext}><ArrowForwardIosIcon /></IconButton>
    </Box>
  );
};

const MoreGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  useEffect(() => {
    fetch('/api/games') // Replace with your actual endpoint for all games
      .then(res => res.json())
      .then(data => setGames(data.games || []));
  }, []);
  if (games.length === 0) return null;
  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>More Games</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {games.slice(0, 8).map(game => (
          <Card key={game.id} sx={{ width: 260, minHeight: 340, display: 'flex', flexDirection: 'column' }}>
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
              <Typography variant="subtitle1">{capitalizeTitle(game.title)}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {game.description ? game.description.slice(0, 60) + (game.description.length > 60 ? '...' : '') : ''}
              </Typography>
              <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                ${game.price}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="primary" size="small">Add to Cart</Button>
                <Button
  variant="contained"
  sx={{ bgcolor: '#B8860B', '&:hover': { bgcolor: '#9A7209' } }}
  onClick={async () => {
    await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: game.id }),
    });
    // Optional: show a toast/snackbar and/or update UI state
  }}
>
  Add to Wishlist
</Button>

              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default function HomePage() {
  return (
    <Layout>
      <PageContainer title="Game Haven" description="Your ultimate gaming destination">
        <DashboardCard title="Featured & Recommended 👍">
          <RecommendationsCarousel />
        </DashboardCard>
        <MoreGames />
      </PageContainer>
    </Layout>
  );
}
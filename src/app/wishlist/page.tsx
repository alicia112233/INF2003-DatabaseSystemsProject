'use client';
import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, CardMedia, Button, Stack, Snackbar, Alert
} from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import Layout from '@/components/layout';

type WishGame = {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  price: number;
};

export default function MyWishlist() {
  const [wishlist, setWishlist] = useState<WishGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState<{open: boolean, msg: string, severity: "success" | "error"}>({open: false, msg: '', severity: "success"});

  // Fetch user's wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch('/api/wishlist');
        if (!res.ok) throw new Error('Failed to fetch wishlist');
        const data = await res.json();
        setWishlist(data.wishlist || []);
      } catch (err) {
        setSnack({ open: true, msg: 'Could not load wishlist.', severity: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemove = async (gameId: number) => {
    try {
      const res = await fetch(`/api/wishlist/${gameId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove from wishlist');
      setWishlist(wishlist.filter(game => game.id !== gameId));
      setSnack({ open: true, msg: 'Removed from wishlist!', severity: "success" });
    } catch (err) {
      setSnack({ open: true, msg: 'Failed to remove from wishlist.', severity: "error" });
    }
  };

  if (loading) {
    return (
      <Layout>
        <PageContainer title="My Wishlist" description="Your saved games">
          <Typography>Loading...</Typography>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer title="My Wishlist" description="Your saved games">
        <DashboardCard title="My Wish List">
          {wishlist.length === 0 ? (
            <Typography>You have not wishlisted any games yet.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {wishlist.map(game => (
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
                    <Typography variant="subtitle1">{game.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {game.description ? game.description.slice(0, 60) + (game.description.length > 60 ? '...' : '') : ''}
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                      ${game.price}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {/* Optionally, allow adding to cart here */}
                      <Button variant="contained" size="small" color="error" onClick={() => handleRemove(game.id)}>
                        Remove
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DashboardCard>
        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={() => setSnack(s => ({ ...s, open: false }))}
            severity={snack.severity}
            sx={{ width: '100%' }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </PageContainer>
    </Layout>
  );
}

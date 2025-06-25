'use client';

import { useEffect, useState } from 'react';
import {
  Box,Typography, Button, Card, CardContent, CardMedia, Stack
} from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import Layout from '@/components/layout';

type Game = {
  id: number;
  title: string;
  genre: string;
  description?: string;
  image_url?: string;
  price: number;
};

function capitalizeTitle(title: string) {
  return title.replace(/\b\w/g, (c) => c.toUpperCase());
}

const ViewGames = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [visibleCount, setVisibleCount] = useState(8);

    useEffect(() => {
        fetch('/api/game-listings/view-horror-games')
        .then((res) => res.json())
        .then(data => setGames(data.games || []))
        .catch((err) => console.error('Error fetching horror games:', err));
    }, []);

    if (games.length === 0) {
        return (
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" color="text.secondary">No horror games found.</Typography>
            </Box>
        );
    }

  
    return (
    <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 6 }} color="text.secondary">Dare to play? Face your fears in terrifying worlds filled with suspense, monsters, and mystery.</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {games.slice(0, visibleCount).map(game => (
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
                <Button variant="contained" color="primary" size="small" sx={{height: 50}}>Add to Cart</Button>
                <Button
                    variant="contained"
                    sx={{ bgcolor: '#B8860B', '&:hover': { bgcolor: '#9A7209' }, height: 50}}
                    onClick={async () => {
                    await fetch('/api/wishlist', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ gameId: game.id }),
                    });
                    }}
                >
                    Add to Wishlist
                </Button>
                </Stack>
            </CardContent>
            </Card>
        ))}
        </Box>

        {visibleCount < games.length && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
            variant="outlined"
            disabled={visibleCount >= games.length}
            onClick={() => setVisibleCount(prev => prev + 8)}
            >
            Load More
            </Button>
        </Box>
        )}
    </Box>
    );

};

export default function DigitalsPage(){
    return (
        <Layout>
            <PageContainer title="Game Haven" description="Your ultimate gaming destination">
                <Typography variant="h4" fontWeight={600} mb={1}>Horror Games</Typography>
                    <ViewGames />
            </PageContainer>
        </Layout>
  );
}

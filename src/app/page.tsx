'use client';
import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Card, CardContent, CardMedia, Stack, IconButton, Grid, CircularProgress, Skeleton, Snackbar, Alert } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import Layout from '@/components/layout';
import AddToCartButton from '@/components/cart/AddToCartButton';
import { Product } from '@/types/cart';

type Game = {
    id: number;
    title: string;
    description?: string;
    image_url?: string;
    price: number | string;
    promo_id?: number;
    inStock?: boolean;
    promotion?: {
        id: number;
        code: string;
        description: string;
        discountValue: number | string;
        discountType: 'percentage' | 'fixed';
        isActive: boolean;
        startDate: string;
        endDate: string;
    };
};

// Helper function to check if user is logged in and is a customer
function isUserLoggedInAndCustomer(): boolean {
    // Check both localStorage and cookies for robustness
    if (typeof window === 'undefined') return false;
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || document.cookie.includes('isLoggedIn=true');
    const userRole = localStorage.getItem('userRole') || (
        document.cookie.match(/userRole=([^;]+)/)?.[1] || ''
    );
    // Your app uses 'customer' for normal users (see login logic)
    return isLoggedIn && userRole === 'customer';
}

function calculatePromotionalPrice(originalPrice: number | string, promotion: Game['promotion']) {
    if (!promotion || !promotion.isActive) return typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice;
    
    const price = typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice;
    const discountValue = typeof promotion.discountValue === 'string' ? parseFloat(promotion.discountValue) : promotion.discountValue;
    
    if (isNaN(price) || isNaN(discountValue)) return price;
    
    if (promotion.discountType === 'percentage') {
        return price * (1 - discountValue / 100);
    } else {
        return Math.max(0, price - discountValue);
    }
}

// Component to display price with promotion
const PriceDisplay = ({ game }: { game: Game }) => {
    const hasActivePromo = game.promotion && game.promotion.isActive;
    // Convert price to number to ensure .toFixed() works
    const originalPrice = typeof game.price === 'string' ? parseFloat(game.price) : game.price;
    const promoPrice = hasActivePromo ? calculatePromotionalPrice(originalPrice, game.promotion) : originalPrice;
    
    // Add safety checks for NaN values
    if (isNaN(originalPrice)) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6" color="error">
                    Price unavailable
                </Typography>
            </Box>
        );
    }
    
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {hasActivePromo && game.promotion ? (
                <>
                    <Typography 
                        variant="h6" 
                        color="error" 
                        sx={{ fontWeight: 'bold' }}
                    >
                        ${promoPrice.toFixed(2)}
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            textDecoration: 'line-through', 
                            color: 'text.secondary' 
                        }}
                    >
                        ${originalPrice.toFixed(2)}
                    </Typography>
                    <Typography 
                        variant="caption" 
                        sx={{ 
                            bgcolor: 'error.main', 
                            color: 'white', 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1,
                            fontWeight: 'bold'
                        }}
                    >
                        -{game.promotion.discountType === 'percentage' 
                            ? `${game.promotion.discountValue}%` 
                            : `$${game.promotion.discountValue}`}
                    </Typography>
                </>
            ) : (
                <Typography variant="h6" color="primary">
                    ${originalPrice.toFixed(2)}
                </Typography>
            )}
        </Box>
    );
};

function capitalizeTitle(title: string) {
    return title.replace(/\b\w/g, (c) => c.toUpperCase());
}

function capitalizeDescription(description: string) {
    if (!description) return description;
    
    // Split by sentences and capitalize the first letter of each
    return description
        .split(/(\. |\.\s+|\n)/)
        .map(sentence => {
            const trimmed = sentence.trim();
            if (trimmed.length === 0) return sentence;
            return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        })
        .join('');
}

interface ProductCardProps {
    product?: Product;
}

const RecommendationsCarousel: React.FC<ProductCardProps> = ({ product }) => {
    const [games, setGames] = useState<Game[]>([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

    const handlePrev = () => setCurrent((prev) => (prev === 0 ? games.length - 1 : prev - 1));
    const handleNext = useCallback(() => {
        setCurrent((prev) => (prev === games.length - 1 ? 0 : prev + 1));
    }, [games.length]);
    
    // 1. Fetch recommendations on mount
    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch('/api/recommendations');
                
                if (!res.ok) {
                    throw new Error(`Failed to fetch recommendations: ${res.status}`);
                }
                
                const data = await res.json();
                setGames(data.recommendations || []);
            } catch (err) {
                console.error('Failed to fetch recommendations:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    // 2. Handle auto-slide when games are available
    useEffect(() => {
        if (games.length === 0 || loading) return;

        const interval = setInterval(() => {
            handleNext();
        }, 3000);

        return () => clearInterval(interval);
    }, [handleNext, games.length, loading]);

    // Loading state
    if (loading) {
        return (
            <Box sx={{ minWidth: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 350 }}>
                <IconButton disabled><ArrowBackIosIcon /></IconButton>
                <Card sx={{ minHeight: 350, mx: 2, display: 'flex', flexDirection: 'row', boxShadow: 3, width: '100%' }}>
                    <Skeleton variant="rectangular" sx={{ width: '60%' }} />
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Skeleton variant="text" sx={{ fontSize: '2rem', width: '80%' }} />
                        <Skeleton variant="text" sx={{ fontSize: '1rem', width: '100%' }} />
                        <Skeleton variant="text" sx={{ fontSize: '1rem', width: '90%' }} />
                        <Skeleton variant="text" sx={{ fontSize: '1.5rem', width: '30%' }} />
                        <Stack direction="row" spacing={2}>
                            <Skeleton variant="rectangular" width={120} height={36} />
                            <Skeleton variant="rectangular" width={140} height={36} />
                        </Stack>
                    </CardContent>
                </Card>
                <IconButton disabled><ArrowForwardIosIcon /></IconButton>
            </Box>
        );
    }

    // Error state
    if (error) {
        return (
            <Box sx={{ minWidth: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 350 }}>
                <Card sx={{ minHeight: 350, mx: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 3 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="error" gutterBottom>
                            Failed to load recommendations
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                        <Button 
                            variant="contained" 
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    // No games state
    if (games.length === 0) {
        return (
            <Box sx={{ minWidth: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 350 }}>
                <Card sx={{ minHeight: 350, mx: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 3 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                            No recommendations available
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Check back later for personalized game recommendations!
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    const game = games[current];
    const isOutOfStock = game.inStock === false;

    return (
        <Box sx={{ minWidth: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 350 }}>
            <IconButton onClick={handlePrev}><ArrowBackIosIcon /></IconButton>
            <Card sx={{ minHeight: 350, mx: 2, display: 'flex', flexDirection: 'row', boxShadow: 3 }}>
                {game.image_url && (
                    <CardMedia
                        component="img"
                        image={game.image_url}
                        alt={game.title}
                        sx={{ width: '60%', objectFit: 'cover' }}
                    />
                )}
                <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 3 }}>
                        {capitalizeTitle(game.title)}
                    </Typography>
                    {game.promotion && (
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                bgcolor: 'success.main', 
                                color: 'white', 
                                px: 1, 
                                py: 0.5, 
                                borderRadius: 1,
                                mb: 1,
                                display: 'inline-block'
                            }}
                        >
                            🎉 {game.promotion.code}: {game.promotion.description}
                        </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 60 }}>
                        {game.description ? capitalizeDescription(game.description).slice(0, 100) + (game.description.length > 100 ? '...' : '') : ''}
                    </Typography>
                    <PriceDisplay game={game} />
                    <Stack direction="row" spacing={2}>
                        <AddToCartButton
                            product={{
                                id: String(game.id),
                                title: game.title,
                                price: typeof game.price === 'string' ? parseFloat(game.price) : game.price,
                                image_url: game.image_url,
                                description: game.description,
                                genreNames: [],
                                inStock: game.inStock,
                            }}
                            onSuccess={(message) => setSnack({ open: true, msg: message, severity: 'success' })}
                            onWarning={(message) => setSnack({ open: true, msg: message, severity: 'warning' })}
                            onError={(message) => setSnack({ open: true, msg: message, severity: 'error' })}
                        />
                        
                        <Button
                            variant="contained"
                            sx={{ bgcolor: '#B8860B', '&:hover': { bgcolor: '#9A7209' } }}
                            onClick={async () => {
                                if (!isUserLoggedInAndCustomer()) {
                                    setSnack({
                                        open: true,
                                        msg: 'Please log in as a customer to add to wishlist.',
                                        severity: 'warning',
                                    });
                                    return;
                                }
                                const res = await fetch('/api/wishlist', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ gameId: game.id }),
                                });
                                const data = await res.json();
                                setSnack({
                                    open: true,
                                    msg: data.message === 'Already in wishlist' ? 'Already in wishlist' : 'Added to wishlist',
                                    severity: data.message === 'Already in wishlist' ? 'warning' : 'success',
                                });
                            }}
                        >
                            Add to Wishlist
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
            <IconButton onClick={handleNext}><ArrowForwardIosIcon /></IconButton>
            <Snackbar
                open={snack.open}
                autoHideDuration={3000}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity as any}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

const MoreGames: React.FC<ProductCardProps> = ({ product }) => {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

    useEffect(() => {
        const fetchGames = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch('/api/games');
                
                if (!res.ok) {
                    throw new Error(`Failed to fetch games: ${res.status}`);
                }
                
                const data = await res.json();
                setGames(data.games || []);
            } catch (err) {
                console.error('Failed to fetch games:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch games');
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, []);
    
    if (loading) {
        return (
            <Box sx={{ mt: 6 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>More Games</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {Array.from({ length: 8 }).map((_, index) => (
                        <Card key={index} sx={{ width: 260, minHeight: 340, display: 'flex', flexDirection: 'column' }}>
                            <Skeleton variant="rectangular" height={140} />
                            <CardContent>
                                <Skeleton variant="text" sx={{ fontSize: '1.2rem', mb: 1 }} />
                                <Skeleton variant="text" sx={{ fontSize: '0.9rem', mb: 1 }} />
                                <Skeleton variant="text" sx={{ fontSize: '0.9rem', mb: 1, width: '40%' }} />
                                <Stack direction="row" spacing={1}>
                                    <Skeleton variant="rectangular" width={80} height={32} />
                                    <Skeleton variant="rectangular" width={100} height={32} />
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 6 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>More Games</Typography>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="error" gutterBottom>
                        Failed to load games
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                    <Button variant="contained" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </Card>
            </Box>
        );
    }

    if (games.length === 0) return null;

    return (
        <Box sx={{ mt: 6 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>More Games</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {games.slice(0, 8).map(game => {                    
                    return (
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
                                    ${typeof game.price === 'string' ? parseFloat(game.price).toFixed(2) : game.price.toFixed(2)}
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <AddToCartButton
                                        product={{
                                            id: String(game.id),
                                            title: game.title,
                                            price: typeof game.price === 'string' ? parseFloat(game.price) : game.price,
                                            image_url: game.image_url,
                                            description: game.description,
                                            genreNames: [],
                                            inStock: game.inStock,
                                        }}
                                        onSuccess={(message) => setSnack({ open: true, msg: message, severity: 'success' })}
                                        onWarning={(message) => setSnack({ open: true, msg: message, severity: 'warning' })}
                                        onError={(message) => setSnack({ open: true, msg: message, severity: 'error' })}
                                    />
                                    
                                    <Button
                                        variant="contained"
                                        sx={{ bgcolor: '#B8860B', '&:hover': { bgcolor: '#9A7209' } }}
                                        onClick={async () => {
                                            if (!isUserLoggedInAndCustomer()) {
                                                setSnack({
                                                    open: true,
                                                    msg: 'Please log in as a customer to add to wishlist.',
                                                    severity: 'warning',
                                                });
                                                return;
                                            }
                                            const res = await fetch('/api/wishlist', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ gameId: game.id }),
                                            });
                                            const data = await res.json();
                                            setSnack({
                                                open: true,
                                                msg: data.message === 'Already in wishlist' ? 'Already in wishlist' : 'Added to wishlist',
                                                severity: data.message === 'Already in wishlist' ? 'warning' : 'success',
                                            });
                                        }}
                                    >
                                        Add to Wishlist
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    );
                })}
            </Box>
            <Snackbar
                open={snack.open}
                autoHideDuration={3000}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity as any}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default function HomePage() {
    return (
        <Layout>
            <PageContainer title="Game Haven" description="Your ultimate gaming destination">
                <DashboardCard title="Featured & Recommended 👍">
                    <RecommendationsCarousel product={undefined} />
                </DashboardCard>
                <MoreGames />
            </PageContainer>
        </Layout>
    );
}
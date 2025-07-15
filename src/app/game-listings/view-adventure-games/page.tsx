'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Button,
  Pagination,
} from '@mui/material';
import Layout from '@/components/layout';
import ProductCard from '@/components/products/ProductCard';
import GameFilters from '@/components/products/GameFilters';
import { PriceRange, Product } from '@/types/cart';

const AdventureGamesPage = () => {
    const [games, setGames] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 1000 });

    const handlePriceRangeChange = (newRange: PriceRange) => {
        setPriceRange(newRange);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const gamesPerPage = 12;

    // Filter states
    const [stockFilter, setStockFilter] = useState('');
    
    // Pagination logic
    const indexOfLastProduct = currentPage * gamesPerPage;
    const indexOfFirstProduct = indexOfLastProduct - gamesPerPage;
    const currentGames = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / gamesPerPage);

    useEffect(() => {
        const fetchGames = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (stockFilter) params.append('stock', stockFilter);

            const res = await fetch(`/api/game-listings/view-adventure-games?${params.toString()}`);
            if (!res.ok) throw new Error(`Failed to fetch games: ${res.status}`);
            const data = await res.json();
            setGames(data.games || []);

            // Apply price filtering on client side
            const filteredByPrice = (data.games as Product[]).filter((game: Product) => {
                const price = game.price || 0;
                return price >= priceRange.min && price <= priceRange.max;
            });
            setFilteredProducts(filteredByPrice);

        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError('Failed to fetch adventure games');
        } finally {
            setLoading(false);
        }
        };
        fetchGames();
    }, [stockFilter, priceRange.min, priceRange.max]);

    useEffect(() => {
        setCurrentPage(1); // reset pagination when filters change
    }, [stockFilter, priceRange.min, priceRange.max]);

    const handleRetry = () => {
        setCurrentPage(1);
        setGames([]);
        setLoading(true);
        setError(null);
        // Re-fetch logic here if you want, or just reload the page
        window.location.reload();
    };

    if (loading) {
        return (
        <Layout>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
            </Box>
        </Layout>
        );
    }

    if (error) {
        return (
        <Layout>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 6 }}>
            <Typography color="error" sx={{ mb: 2 }}>
                {error}
            </Typography>
            <Button variant="contained" onClick={handleRetry}>
                Retry
            </Button>
            </Box>
        </Layout>
        );
    }

    return (
        <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight={600} mb={1}>
            Adventure Games
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Embark on epic quests, uncover hidden secrets, and <br/> get lost in unforgettable story-driven worlds.

            </Typography>
            <GameFilters
                stockFilter={stockFilter}
                priceRange={priceRange}
                onStockFilterChange={setStockFilter}
                onPriceRangeChange={handlePriceRangeChange}
                minPrice={0}
                maxPrice={1000}
            />

            {games.length === 0 ? (
            <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 6 }}>
                No action games found.
            </Typography>
            ) : (
            <>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Showing {filteredProducts.length} of {games.length} games
                    </Typography>
                </Box>
                <Grid container spacing={3}>
                {currentGames.map((game) => (
                    <Grid
                        size={{
                            xs: 12,
                            md: 6,
                            lg: 4,
                            xl: 3,
                        }}
                        key={game.id}
                    >
                    <ProductCard product={game} />
                    </Grid>
                ))}
                </Grid>

                {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, page) => setCurrentPage(page)}
                    color="primary"
                    />
                </Box>
                )}
            </>
            )}
        </Container>
        </Layout>
    );
};

export default AdventureGamesPage;

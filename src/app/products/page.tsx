'use client';

import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Box, CircularProgress, Button, Pagination } from '@mui/material';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import Layout from '@/components/layout';
import { PriceRange, Product } from '@/types/cart';
import Link from 'next/link';


const ProductsPage = () => {
    const [games, setGames] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 1000 });

    const handlePriceRangeChange = (newRange: PriceRange) => {
        setPriceRange(newRange);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 16;

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');

    // Pagination logic
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    // Single useEffect for fetching and filtering games
    useEffect(() => {
        const fetchGames = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams();
                if (searchTerm) params.append('search', searchTerm);
                if (categoryFilter) params.append('genre', categoryFilter);
                if (stockFilter) params.append('stock', stockFilter);

                const res = await fetch(`/api/games?${params.toString()}`);
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
                else setError('Failed to fetch games');
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, [searchTerm, categoryFilter, stockFilter, priceRange.min, priceRange.max]);

    useEffect(() => {
        setCurrentPage(1); // reset pagination when filters change
    }, [searchTerm, categoryFilter, stockFilter, priceRange.min, priceRange.max]);

    const handleRetry = () => {
        window.location.reload();
    };

    // Show loading spinner
    if (loading) {
        return (
            <Layout>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                    <CircularProgress />
                </Box>
            </Layout>
        );
    }

    // Show error state
    if (error) {
        return (
            <Layout>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 6 }}>
                    <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
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
                <Typography variant="h4" component="h1" gutterBottom>
                    All Games
                </Typography>

                <ProductFilters
                    searchTerm={searchTerm}
                    categoryFilter={categoryFilter}
                    stockFilter={stockFilter}
                    priceRange={priceRange}
                    onSearchChange={setSearchTerm}
                    onCategoryFilterChange={setCategoryFilter}
                    onStockFilterChange={setStockFilter}
                    onPriceRangeChange={handlePriceRangeChange}
                    minPrice={0}
                    maxPrice={1000}
                />

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        Showing {filteredProducts.length} of {games.length} games
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {currentProducts.map((product) => (
                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                                lg: 4,
                                xl: 3,
                            }}
                            key={product.id}
                        >
                            <ProductCard product={product} />
                        </Grid>
                    ))}
                </Grid>
                
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={(event, value) => setCurrentPage(value)}
                            color="primary"
                        />
                    </Box>
                )}

                {filteredProducts.length === 0 && games.length > 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                            No games found matching your criteria
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Try adjusting your filters
                        </Typography>
                    </Box>
                )}
            </Container>
        </Layout>
    );
};

export default ProductsPage;
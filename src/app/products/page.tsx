'use client';

import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Box, CircularProgress, Button, Pagination } from '@mui/material';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import Layout from '@/components/layout';
import { Product } from '@/types/cart';

const ProductsPage = () => {
    const [games, setGames] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 8;

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');

    // Pagination logic
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    // Filter games based on search term, category, and stock status
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
                setFilteredProducts(data.games || []); // filtering is done server-side
            } catch (err: unknown) {
                if (err instanceof Error) setError(err.message);
                else setError('Failed to fetch games');
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, [searchTerm, categoryFilter, stockFilter]);

    const fetchGames = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/games');
            if (!res.ok) throw new Error(`Failed to fetch games: ${res.status}`);
            const data = await res.json();
            setGames(data.games || []);
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError('Failed to fetch games');
        } finally {
            setLoading(false);
        }
        }, []);

    useEffect(() => {
        fetchGames();
    }, [fetchGames]);

    useEffect(() => {
        setCurrentPage(1); // reset pagination when filters change
    }, [searchTerm, categoryFilter, stockFilter]);

    // Show loading spinner
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }
    else if (error) {
        <Button variant="contained" onClick={fetchGames}>
            Retry
        </Button>
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
                    onSearchChange={setSearchTerm}
                    onCategoryFilterChange={setCategoryFilter}
                    onStockFilterChange={setStockFilter}
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
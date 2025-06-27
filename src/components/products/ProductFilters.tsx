'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface Genre {
    id: number;
    name: string;
}

interface ProductFiltersProps {
    searchTerm: string;
    categoryFilter: string;
    stockFilter: string;
    onSearchChange: (value: string) => void;
    onCategoryFilterChange: (value: string) => void;
    onStockFilterChange: (value: string) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
    searchTerm,
    categoryFilter,
    stockFilter,
    onSearchChange,
    onCategoryFilterChange,
    onStockFilterChange,
}) => {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loadingGenres, setLoadingGenres] = useState(false);

    useEffect(() => {
        const fetchGenres = async () => {
            setLoadingGenres(true);
            try {
                const response = await fetch('/api/genres');
                if (response.ok) {
                    const genresData = await response.json();
                    setGenres(genresData);
                } else {
                    console.error('Failed to fetch genres');
                }
            } catch (error) {
                console.error('Error fetching genres:', error);
            } finally {
                setLoadingGenres(false);
            }
        };

        fetchGenres();
    }, []);

    return (
        <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
                <Grid
                    size={{
                        xs: 12,
                        md: 6,
                        lg: 6,
                    }}
                >
                    <TextField
                        fullWidth
                        placeholder="Search products by name or description..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        md: 6,
                        lg: 3,
                    }}
                >
                    <FormControl fullWidth>
                        <InputLabel>Genre</InputLabel>
                        <Select
                            value={categoryFilter}
                            label="Genre"
                            onChange={(e) => onCategoryFilterChange(e.target.value)}
                            disabled={loadingGenres}
                        >
                            <MenuItem value="">All Genres</MenuItem>
                            {loadingGenres ? (
                                <MenuItem disabled>
                                    <CircularProgress size={20} sx={{ mr: 1 }} />
                                    Loading genres...
                                </MenuItem>
                            ) : (
                                genres.map((genre) => (
                                    <MenuItem key={genre.id} value={genre.id.toString()}>
                                        {genre.name}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        md: 6,
                        lg: 3,
                    }}
                >
                    <FormControl fullWidth>
                        <InputLabel>Stock Status</InputLabel>
                        <Select
                            value={stockFilter}
                            label="Stock Status"
                            onChange={(e) => onStockFilterChange(e.target.value)}
                        >
                            <MenuItem value="">All Stock Status</MenuItem>
                            <MenuItem value="inStock">In Stock</MenuItem>
                            <MenuItem value="outOfStock">Out of Stock</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProductFilters;
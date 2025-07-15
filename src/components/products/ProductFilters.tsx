'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    Slider,
    Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface Genre {
    id: number;
    name: string;
}

interface PriceRange {
    min: number;
    max: number;
}

interface ProductFiltersProps {
    searchTerm: string;
    categoryFilter: string;
    stockFilter: string;
    priceRange: PriceRange;
    onSearchChange: (value: string) => void;
    onCategoryFilterChange: (value: string) => void;
    onStockFilterChange: (value: string) => void;
    onPriceRangeChange: (value: PriceRange) => void;
    maxPrice?: number;
    minPrice?: number;
    availableStockStatuses?: { value: string; label: string }[];
}

// Custom hook for debouncing
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const ProductFilters: React.FC<ProductFiltersProps> = ({
    searchTerm,
    categoryFilter,
    stockFilter,
    priceRange,
    onSearchChange,
    onCategoryFilterChange,
    onStockFilterChange,
    onPriceRangeChange,
    maxPrice = 1000,
    minPrice = 0,
    availableStockStatuses = [
        { value: '', label: 'All Games' },
        { value: 'onSale', label: 'On Sale' },
        { value: 'inStock', label: 'In Stock' },
        { value: 'outOfStock', label: 'Out of Stock' },
    ],
}) => {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loadingGenres, setLoadingGenres] = useState(false);
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const [localPriceRange, setLocalPriceRange] = useState<number[]>([
        priceRange.min,
        priceRange.max,
    ]);

    // Debounce search term to reduce API calls
    const debouncedSearchTerm = useDebounce(localSearchTerm, 300);

    // Debounce price range changes
    const debouncedPriceRange = useDebounce(
        JSON.stringify(localPriceRange),
        500
    );

    // Memoize genres to prevent unnecessary re-renders
    const memoizedGenres = useMemo(() => genres, [genres]);

    // Effect for debounced search
    useEffect(() => {
        if (debouncedSearchTerm !== searchTerm) {
            onSearchChange(debouncedSearchTerm);
        }
    }, [debouncedSearchTerm, onSearchChange, searchTerm]);

    // Effect for debounced price range
    useEffect(() => {
        const parsedPriceRange = JSON.parse(debouncedPriceRange);
        const newPriceRange = {
            min: parsedPriceRange[0],
            max: parsedPriceRange[1],
        };
        
        if (
            newPriceRange.min !== priceRange.min ||
            newPriceRange.max !== priceRange.max
        ) {
            onPriceRangeChange(newPriceRange);
        }
    }, [debouncedPriceRange, onPriceRangeChange, priceRange]);

    // Memoized fetch function to prevent unnecessary re-fetches
    const fetchGenres = useCallback(async () => {
        if (genres.length > 0) return;
        
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
    }, [genres.length]);

    useEffect(() => {
        fetchGenres();
    }, [fetchGenres]);

    // Handle local search input change
    const handleSearchInputChange = useCallback((value: string) => {
        setLocalSearchTerm(value);
    }, []);

    // Handle price range change
    const handlePriceRangeChange = useCallback(
        (event: Event, newValue: number | number[]) => {
            if (Array.isArray(newValue)) {
                setLocalPriceRange(newValue);
            }
        },
        []
    );

    // Price range formatter
    const formatPrice = (value: number) => `${value}`;

    return (
        <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
                {/* Search Field */}
                <Grid
                    size={{
                        xs: 12,
                        md: 6,
                        lg: 4,
                    }}
                >
                    <TextField
                        fullWidth
                        placeholder="Search products by name or description..."
                        value={localSearchTerm}
                        onChange={(e) => handleSearchInputChange(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>

                {/* Genre Filter */}
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
                                memoizedGenres.map((genre) => (
                                    <MenuItem key={genre.id} value={genre.id.toString()}>
                                        {genre.name}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Games Status Filter */}
                <Grid
                    size={{
                        xs: 12,
                        md: 6,
                        lg: 2,
                    }}
                >
                    <FormControl fullWidth>
                        <InputLabel>Games Status</InputLabel>
                        <Select
                            value={stockFilter}
                            label="Games Status"
                            onChange={(e) => onStockFilterChange(e.target.value)}
                        >
                            {availableStockStatuses.map((status) => (
                                <MenuItem key={status.value} value={status.value}>
                                    {status.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Price Range Filter */}
                <Grid
                    size={{
                        xs: 12,
                        md: 6,
                        lg: 3,
                    }}
                >
                    <Box sx={{ px: 2, py: 1 }}>
                        <Typography gutterBottom variant="body2" color="text.secondary">
                            Price Range
                        </Typography>
                        <Slider
                            value={localPriceRange}
                            onChange={handlePriceRangeChange}
                            valueLabelDisplay="auto"
                            valueLabelFormat={formatPrice}
                            min={minPrice}
                            max={maxPrice}
                            sx={{ mt: 1 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                {formatPrice(localPriceRange[0])}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatPrice(localPriceRange[1])}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProductFilters;
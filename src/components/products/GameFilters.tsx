'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Typography,
} from '@mui/material';

interface PriceRange {
    min: number;
    max: number;
}

interface ProductFiltersProps {
    stockFilter: string;
    priceRange: PriceRange;
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

const GameFilters: React.FC<ProductFiltersProps> = ({
    stockFilter,
    priceRange,
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
    const [localPriceRange, setLocalPriceRange] = useState<number[]>([
        priceRange.min,
        priceRange.max,
    ]);

    // Debounce price range changes
    const debouncedPriceRange = useDebounce(
        JSON.stringify(localPriceRange),
        500
    );

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
        <Box sx={{ mb: 1 }}>
            <Grid container spacing={5} justifyContent="flex-end">

                {/* Games Status Filter */}
                <Grid
                    size={{
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
                    <Box sx={{ px: 3 }}>
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

export default GameFilters;
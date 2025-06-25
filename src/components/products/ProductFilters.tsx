'use client';

import React from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

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
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => onCategoryFilterChange(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="Electronics">Electronics</MenuItem>
              <MenuItem value="Clothing">Clothing</MenuItem>
              <MenuItem value="Books">Books</MenuItem>
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
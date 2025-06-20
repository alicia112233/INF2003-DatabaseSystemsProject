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

interface PromotionFiltersProps {
  searchTerm: string;
  typeFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
}

const PromotionFilters: React.FC<PromotionFiltersProps> = ({
  searchTerm,
  statusFilter,
  typeFilter,
  onSearchChange,
  onTypeFilterChange,
  onStatusFilterChange,
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
            placeholder="Search promotions by code or description..."
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
            xs: 6,
            md: 3,
            lg: 3,
          }}
        >
          <FormControl fullWidth>
            <InputLabel>Discount Type</InputLabel>
            <Select
              value={typeFilter}
              label="Discount Type"
              onChange={(e) => onTypeFilterChange(e.target.value)}
            >
              <MenuItem value="">All Discount Types</MenuItem>
              <MenuItem value="fixed">Fixed</MenuItem>
              <MenuItem value="percentage">Percentage</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid 
          size={{
            xs: 6,
            md: 3,
            lg: 3,
          }}
        >
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => onStatusFilterChange(e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="expired">Expired</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PromotionFilters;
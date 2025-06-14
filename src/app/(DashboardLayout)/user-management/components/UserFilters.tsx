'use client';

import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Grid,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface UserFiltersProps {
  searchTerm: string;
  roleFilter: string;
  genderFilter: string;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onGenderFilterChange: (value: string) => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  searchTerm,
  roleFilter,
  genderFilter,
  onSearchChange,
  onRoleFilterChange,
  onGenderFilterChange,
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
            placeholder="Search users by name or email..."
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
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => onRoleFilterChange(e.target.value)}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="T">Admin</MenuItem>
              <MenuItem value="F">Customer</MenuItem>
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
            <InputLabel>Gender</InputLabel>
            <Select
              value={genderFilter}
              label="Gender"
              onChange={(e) => onGenderFilterChange(e.target.value)}
            >
              <MenuItem value="">All Genders</MenuItem>
              <MenuItem value="M">Male</MenuItem>
              <MenuItem value="F">Female</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserFilters;
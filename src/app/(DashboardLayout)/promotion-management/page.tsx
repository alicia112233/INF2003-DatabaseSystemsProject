/* eslint-disable react/no-unescaped-entities */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Alert,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    TablePagination,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import { Promotion, CreatePromotionRequest } from '@/types/promotion';
import PromotionFilters from './components/PromotionFilters';
import PromotionFormDialog from './components/PromotionFormDialog';

const PromotionManagement = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
    const [paginatedPromotions, setPaginatedPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    
    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Snackbar
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    // Fetch promotions - wrapped in useCallback to prevent unnecessary re-renders
    const fetchPromotions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/promotions');
            if (!response.ok) throw new Error('Failed to fetch promotions');
            
            const data: Promotion[] = await response.json();

            // Fetch assigned games for each promotion in parallel
            const enrichedData = await Promise.all(
                data.map(async (promotion) => {
                    try {
                        const res = await fetch(`/api/promotions/${promotion.id}/assigned-games`);
                        if (res.ok) {
                            const games = await res.json();
                            return { ...promotion, selectedGames: games };
                        } else {
                            return { ...promotion, selectedGames: [] };
                        }
                    } catch {
                        return { ...promotion, selectedGames: [] };
                    }
                })
            );

            setPromotions(enrichedData);
        } catch (error) {
            showSnackbar('Failed to fetch promotions', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    // Filter promotions
    useEffect(() => {
        let filtered = promotions;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (promotion) =>
                    promotion.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    promotion.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter) {
            const currentDate = new Date();
            filtered = filtered.filter((promotion) => {
                const startDate = new Date(promotion.startDate);
                const endDate = new Date(promotion.endDate);

                switch (statusFilter) {
                    case 'active':
                        return promotion.isActive && endDate >= currentDate;
                    case 'inactive':
                        return !promotion.isActive;
                    case 'scheduled':
                        return startDate > currentDate;
                    case 'expired':
                        return endDate < currentDate;
                    default:
                        return true;
                }
            });
        }

        // Discount Type filter
        if (typeFilter) {
            filtered = filtered.filter((promotion) => {
                switch (typeFilter) {
                    case 'fixed':
                        return promotion.discountType == 'fixed';
                    case 'percentage':
                        return promotion.discountType == 'percentage';
                    default:
                        return true;
                }
            });
        }

        setFilteredPromotions(filtered);
        // Reset to first page when filters change
        setPage(0);
    }, [promotions, searchTerm, typeFilter, statusFilter]);

    // Handle pagination
    useEffect(() => {
        const startIndex = page * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        setPaginatedPromotions(filteredPromotions.slice(startIndex, endIndex));
    }, [filteredPromotions, page, rowsPerPage]);

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Pagination handlers
    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Create/Update promotion
    const handleSubmitPromotion = async (data: CreatePromotionRequest) => {
        try {
            setFormLoading(true);
            const url = selectedPromotion
                ? `/api/promotions/${selectedPromotion.id}`
                : '/api/promotions';

            const method = selectedPromotion ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                showSnackbar(
                    `Promotion ${selectedPromotion ? 'updated' : 'created'} successfully`,
                    'success'
                );
                setFormDialogOpen(false);
                setSelectedPromotion(null);
                // Refresh promotions list
                fetchPromotions();
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save promotion');
            }
        } catch (error: any) {
            showSnackbar(error.message, 'error');
        } finally {
            setFormLoading(false);
        }
    };

    // Delete promotion
    const handleDeletePromotion = async () => {
        if (!selectedPromotion) return;

        try {
            const response = await fetch(`/api/promotions/${selectedPromotion.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                showSnackbar('Promotion deleted successfully', 'success');
                setDeleteDialogOpen(false);
                setSelectedPromotion(null);
                fetchPromotions();
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete promotion');
            }
        } catch (error: any) {
            showSnackbar(error.message, 'error');
        }
    };

    // Get promotion status
    const getPromotionStatus = (promotion: Promotion) => {
        const currentDate = new Date();
        const endDate = new Date(promotion.endDate);
        const startDate = new Date(promotion.startDate);

        // Normalize all dates to midnight for comparison
        const today = new Date(currentDate).setHours(0, 0, 0, 0);
        const endDateNormalized = new Date(endDate).setHours(0, 0, 0, 0);
        const startDateNormalized = new Date(startDate).setHours(0, 0, 0, 0);

        if (!promotion.isActive) {
            return { label: 'Inactive', color: 'default' as const };
        }

        if (endDateNormalized < today) {
            return { label: 'Expired', color: 'error' as const };
        }

        if (startDateNormalized > today) {
            return { label: 'Scheduled', color: 'warning' as const };
        }

        return { label: 'Active', color: 'success' as const };
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    // Format discount display
    const formatDiscount = (value: number | string, type: 'percentage' | 'fixed') => {
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        
        // Handle invalid numbers
        if (isNaN(numValue)) {
            return type === 'percentage' ? '0%' : '$0.00';
        }
        
        if (type === 'percentage') {
            return `${numValue}%`;
        }
        return `${numValue.toFixed(2)}`;
    };

    return (
        <Box>
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" component="h1">
                            Promotion Management
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                setSelectedPromotion(null);
                                setFormDialogOpen(true);
                            }}
                        >
                            Add Promotion
                        </Button>
                    </Box>

                    <PromotionFilters
                        searchTerm={searchTerm}
                        typeFilter={typeFilter}
                        statusFilter={statusFilter}
                        onSearchChange={setSearchTerm}
                        onTypeFilterChange={setTypeFilter}
                        onStatusFilterChange={setStatusFilter}
                    />

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Code</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Discount</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Usage</TableCell>
                                            <TableCell>Start Date</TableCell>
                                            <TableCell>End Date</TableCell>
                                            <TableCell>Applied Games</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedPromotions.map((promotion) => {
                                            const status = getPromotionStatus(promotion);
                                            return (
                                                <TableRow key={promotion.id}>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {promotion.code}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                                                            {promotion.description}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {formatDiscount(promotion.discountValue, promotion.discountType)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={promotion.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                                                            color={promotion.discountType === 'percentage' ? 'primary' : 'secondary'}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {promotion.maxUsage
                                                            ? `${promotion.usedCount}/${promotion.maxUsage}`
                                                            : `${promotion.usedCount}/∞`
                                                        }
                                                    </TableCell>
                                                    <TableCell>{formatDate(promotion.startDate)}</TableCell>
                                                    <TableCell>{formatDate(promotion.endDate)}</TableCell>
                                                    <TableCell sx={{ maxWidth: 200 }}>
                                                        {promotion.applicableToAll ? (
                                                            <Chip label="All Games" size="small" color="info" />
                                                        ) : (
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {promotion.selectedGames?.length ? (
                                                                    promotion.selectedGames.map((game) => (
                                                                        <Chip key={game.id} label={game.title} size="small" />
                                                                    ))
                                                                ) : (
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        No games
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={status.label}
                                                            color={status.color}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setSelectedPromotion(promotion);
                                                                setFormDialogOpen(true);
                                                            }}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => {
                                                                setSelectedPromotion(promotion);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {paginatedPromotions.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={9} align="center">
                                                    <Typography variant="body2" color="text.secondary">
                                                        No promotions found
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            
                            {/* Pagination Component */}
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                component="div"
                                count={filteredPromotions.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                sx={{ mt: 2 }}
                            />
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ 
                    vertical: 'top', 
                    horizontal: 'center' 
                }}
                sx={{
                    zIndex: (theme) => theme.zIndex.modal + 1,
                }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Form Dialog */}
            <PromotionFormDialog
                open={formDialogOpen}
                onClose={() => {
                    setFormDialogOpen(false);
                    setSelectedPromotion(null);
                }}
                onSubmit={handleSubmitPromotion}
                promotion={selectedPromotion}
                loading={formLoading}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the promotion "{selectedPromotion?.code}"?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeletePromotion} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PromotionManagement;
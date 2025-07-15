'use client';

import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
} from '@mui/material';
import Image from 'next/image';
import { CalendarMonth } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { Product } from '@/types/cart';
import { useCart } from '@/contexts/CartContext';

interface RentButtonProps {
    product: Product;
    fullWidth?: boolean;
    variant?: 'contained' | 'outlined' | 'text';
    disabled?: boolean;
    onSuccess?: (message: string) => void;
    onWarning?: (message: string) => void;
    onError?: (message: string) => void;
}

const RentButton: React.FC<RentButtonProps> = ({
    product,
    fullWidth = false,
    variant = 'outlined',
    disabled = false,
    onWarning,
}) => {
    const [open, setOpen] = useState(false);
    const [days, setDays] = useState(1);
    const { addToCart } = useCart();

    const gamePrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const dailyRate = gamePrice * 0.25; // Quarter of the game price
    const totalCost = dailyRate * days;

    // Function to check if user is logged in
    const isUserLoggedInAndCustomer = () => {
        if (typeof window === 'undefined') return false;
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || document.cookie.includes('isLoggedIn=true');
        const userRole = localStorage.getItem('userRole') || (
            document.cookie.match(/userRole=([^;]+)/)?.[1] || ''
        );
        return isLoggedIn && userRole === 'customer';
    };

    const handleAddRentalToCart = () => {
        try {
            // Add rental item to cart
            addToCart({
                productId: product.id,
                title: `${product.title} (${days} day rental)`,
                price: totalCost,
                quantity: 1,
                image_url: product.image_url,
                description: `${days} day rental - Daily rate: $${dailyRate.toFixed(2)}`,
                type: 'rental',
                rentalDays: days,
                dailyRate: dailyRate,
            });

            toast.success(`${product.title} rental added to cart!`);
            setOpen(false);
            setDays(1);
        } catch (error) {
            console.error('Error adding rental to cart:', error);
            toast.error('Failed to add rental to cart');
        }
    };

    const handleDaysChange = (event: any) => {
        const value = parseInt(event.target.value);
        if (value >= 1 && value <= 30) {
            setDays(value);
        }
    };

    return (
        <>
            <Button
                variant={variant}
                fullWidth={fullWidth}
                disabled={disabled}
                startIcon={<CalendarMonth />}
                onClick={() => {
                    if (!isUserLoggedInAndCustomer()) {
                        if (onWarning) {
                            onWarning('Please log in to rent this game.');
                        }
                        return;
                    }
                    setOpen(true);
                }}
                sx={{
                    mt: 1,
                    bgcolor: variant === 'contained' ? 'success.main' : 'transparent',
                    color: variant === 'contained' ? 'white' : 'success.main',
                    borderColor: 'success.main',
                    '&:hover': {
                        bgcolor: variant === 'contained' ? 'success.dark' : 'success.light',
                        borderColor: 'success.dark',
                    }
                }}
            >
                Rent Game
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Rent {product.title}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Add this rental to your cart, then proceed to checkout to complete the rental process.
                        </Alert>

                        <Box display="flex" alignItems="center" gap={2} mb={3}>
                            <Image
                                src={product.image_url || '/images/products/noprodimg.png'}
                                alt={product.title}
                                width={80}
                                height={80}
                                style={{ objectFit: 'cover', borderRadius: 8 }}
                            />
                            <Box>
                                <Typography variant="h6">{product.title}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Purchase Price: ${Number(product.price).toFixed(2)}
                                </Typography>
                                <Typography variant="body2" color="success.main" fontWeight="bold">
                                    Daily Rental Rate: ${dailyRate.toFixed(2)}/day
                                </Typography>
                            </Box>
                        </Box>

                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Rental Duration</InputLabel>
                            <Select
                                value={days}
                                onChange={handleDaysChange}
                                label="Rental Duration"
                            >
                                {[...Array(30)].map((_, i) => (
                                    <MenuItem key={i + 1} value={i + 1}>
                                        {i + 1} day{i + 1 > 1 ? 's' : ''} - ${(dailyRate * (i + 1)).toFixed(2)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{
                            p: 2,
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'grey.200'
                        }}>
                            <Typography variant="body2" color="text.secondary">
                                Rental Summary:
                            </Typography>
                            <Typography variant="body1">
                                Duration: {days} day{days > 1 ? 's' : ''}
                            </Typography>
                            <Typography variant="body1">
                                Daily Rate: ${dailyRate.toFixed(2)}
                            </Typography>
                            <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                                Total Cost: ${totalCost.toFixed(2)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Return by: {new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddRentalToCart}
                        variant="contained"
                        sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
                    >
                        Add to Cart - ${totalCost.toFixed(2)}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default RentButton;
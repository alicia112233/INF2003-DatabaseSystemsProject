'use client';

import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Divider,
    Box,
} from '@mui/material';
import { useCart } from '@/contexts/CartContext';

interface CartSummaryProps {
    onCheckout?: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({ onCheckout }) => {
    const {
        cart,
        getCartTotal,
        getCartOriginalTotal,
        getTotalSavings,
        getCartItemCount,
        clearCart
    } = useCart();

    const itemCount = getCartItemCount();
    
    // Helper function to safely parse prices
    const getValidPrice = (price: any): number => {
        if (typeof price === 'number' && !isNaN(price)) {
            return price;
        }
        if (typeof price === 'string') {
            const parsed = parseFloat(price);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    };

    const getValidQuantity = (quantity: any): number => {
        if (typeof quantity === 'number' && !isNaN(quantity)) {
            return Math.max(quantity, 1);
        }
        if (typeof quantity === 'string') {
            const parsed = parseInt(quantity);
            return isNaN(parsed) ? 1 : Math.max(parsed, 1);
        }
        return 1;
    };

    // Ensure we have valid numbers - no more NaN issues
    const originalTotal = getCartOriginalTotal() || 0;
    const discountedTotal = getCartTotal() || 0;
    const totalSavings = getTotalSavings() || 0;

    // Separate purchase and rental totals with safe price handling
    const purchaseItems = cart?.items?.filter(item => item.type !== 'rental') || [];
    const rentalItems = cart?.items?.filter(item => item.type === 'rental') || [];

    const purchaseTotal = purchaseItems.reduce((sum, item) => {
        const price = getValidPrice(item.price);
        const quantity = getValidQuantity(item.quantity);
        return sum + (price * quantity);
    }, 0);

    const rentalTotal = rentalItems.reduce((sum, item) => {
        const price = getValidPrice(item.price);
        const quantity = getValidQuantity(item.quantity);
        return sum + (price * quantity);
    }, 0);

    // Use the calculated totals if context totals are NaN
    const safeDiscountedTotal = isNaN(discountedTotal) ? (purchaseTotal + rentalTotal) : discountedTotal;
    const safeOriginalTotal = isNaN(originalTotal) ? safeDiscountedTotal : originalTotal;
    const safeTotalSavings = isNaN(totalSavings) ? Math.max(safeOriginalTotal - safeDiscountedTotal, 0) : totalSavings;

    // Debug cart data
    console.log('CartSummary - Cart data:', {
        appliedPromoCodes: cart?.appliedPromoCodes,
        items: cart?.items?.map(item => ({ 
            title: item.title, 
            promo_code: item.promo_code,
            promotion: item.promotion 
        })),
        safeTotalSavings
    });

    // Calculate tax on the discounted total (after promo codes)
    const tax = safeDiscountedTotal * 0.1;

    // Final total = discounted total + tax
    const finalTotal = safeDiscountedTotal + tax;

    if (!cart || itemCount === 0) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Cart Summary
                    </Typography>
                    <Typography color="text.secondary">
                        Your cart is empty
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Cart Summary
                </Typography>

                {purchaseItems.length > 0 && (
                    <Box display="flex" justifyContent="space-between" mb={1} flexDirection="column">
                        <Typography>Purchases ({purchaseItems.length})</Typography>
                        <Box>
                            {purchaseItems.map((item, idx) => {
                                const validOriginal = item.originalPrice && item.originalPrice > item.price;
                                return (
                                    <Box key={idx} display="flex" justifyContent="space-between" pl={1}>
                                        <Typography variant="body2">
                                            {item.title}
                                        </Typography>
                                        <Typography variant="body2" align="right">
                                            {validOriginal ? (
                                                <>
                                                    <span style={{ textDecoration: 'line-through', color: '#888' }}>
                                                        ${item.originalPrice!.toFixed(2)}
                                                    </span>{' '}
                                                    <span style={{ fontWeight: 600 }}>
                                                        ${item.price.toFixed(2)}
                                                    </span>
                                                </>
                                            ) : (
                                                <>${item.price.toFixed(2)}</>
                                            )}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" justifyContent="space-between">
                            <Typography fontWeight="bold">Purchase Subtotal</Typography>
                            <Typography fontWeight="bold">${purchaseTotal.toFixed(2)}</Typography>
                        </Box>
                    </Box>
                )}

                {rentalItems.length > 0 && (
                    <Box display="flex" justifyContent="space-between" mb={1} flexDirection="column">
                        <Typography color="success.main">Rentals ({rentalItems.length})</Typography>
                        <Box>
                            {rentalItems.map((item, idx) => {
                                const validOriginal = item.originalPrice && item.originalPrice > item.price;
                                return (
                                    <Box key={idx} display="flex" justifyContent="space-between" pl={1}>
                                        <Typography variant="body2">
                                            {item.title}
                                        </Typography>
                                        <Typography variant="body2" align="right">
                                            {validOriginal ? (
                                                <>
                                                    <span style={{ textDecoration: 'line-through', color: '#888' }}>
                                                        ${item.originalPrice!.toFixed(2)}
                                                    </span>{' '}
                                                    <span style={{ fontWeight: 600 }}>
                                                        ${item.price.toFixed(2)}
                                                    </span>
                                                </>
                                            ) : (
                                                <>${item.price.toFixed(2)}</>
                                            )}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" justifyContent="space-between">
                            <Typography fontWeight="bold">
                                Rental Subtotal
                            </Typography>
                            <Typography fontWeight="bold">
                                ${rentalTotal.toFixed(2)}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {cart.appliedPromoCodes && cart.appliedPromoCodes.length > 0 && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="success.dark" gutterBottom>
                            🎯 Active Promotion{cart.appliedPromoCodes.length > 1 ? 's' : ''}:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                            {cart.appliedPromoCodes.map((code, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        bgcolor: 'white',
                                        color: 'success.main',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 0.5,
                                        fontWeight: 'bold',
                                        fontSize: '0.75rem',
                                        border: '1px solid',
                                        borderColor: 'success.main'
                                    }}
                                >
                                    {code}
                                </Box>
                            ))}
                        </Box>
                        {safeTotalSavings > 0 && (
                            <Typography variant="body2" color="success.dark" fontWeight="bold">
                                Savings: -${safeTotalSavings.toFixed(2)}
                            </Typography>
                        )}
                    </Box>
                )}

                {safeTotalSavings > 0 && (
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography color="text.secondary">
                            Total ({itemCount} items)
                        </Typography>
                        <Typography color="text.secondary">
                            ${safeOriginalTotal.toFixed(2)}
                        </Typography>
                    </Box>
                )}

                <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>
                        Subtotal ({itemCount} items)
                        {safeTotalSavings > 0 && (
                            <Typography component="span" color="success.main" sx={{ ml: 1 }}>
                                (After Discounts)
                            </Typography>
                        )}
                    </Typography>
                    <Typography>${safeDiscountedTotal.toFixed(2)}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography>Tax (10%)</Typography>
                    <Typography>${tax.toFixed(2)}</Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Box display="flex" justifyContent="space-between" mb={3}>
                    <Typography variant="h6">Final Total</Typography>
                    <Typography variant="h6" color="primary">
                        ${finalTotal.toFixed(2)}
                    </Typography>
                </Box>

                {safeTotalSavings > 0 && (
                    <Box display="flex" justifyContent="center" mb={2}>
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                            You saved ${safeTotalSavings.toFixed(2)}!
                        </Typography>
                    </Box>
                )}

                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={onCheckout}
                    sx={{ mb: 1 }}
                >
                    Proceed to Checkout
                </Button>

                <Button
                    variant="outlined"
                    fullWidth
                    onClick={clearCart}
                    color="error"
                >
                    Clear Cart
                </Button>
            </CardContent>
        </Card>
    );
};

export default CartSummary;
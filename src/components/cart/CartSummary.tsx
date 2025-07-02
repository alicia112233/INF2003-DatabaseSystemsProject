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
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography>Purchases ({purchaseItems.length})</Typography>
                        <Typography>${purchaseTotal.toFixed(2)}</Typography>
                    </Box>
                )}

                {rentalItems.length > 0 && (
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography color="success.main">Rentals ({rentalItems.length})</Typography>
                        <Typography color="success.main">${rentalTotal.toFixed(2)}</Typography>
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

                {cart.appliedPromoCodes && cart.appliedPromoCodes.length > 0 && safeTotalSavings > 0 && (
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Box>
                            <Typography color="success.main" variant="body2">
                                Promo Code{cart.appliedPromoCodes.length > 1 ? 's' : ''} Applied:
                            </Typography>
                            <Typography component="span" variant="caption" color="text.secondary">
                                {cart.appliedPromoCodes.join(', ')}
                            </Typography>
                        </Box>
                        <Typography color="success.main" fontWeight="bold">
                            -${safeTotalSavings.toFixed(2)}
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
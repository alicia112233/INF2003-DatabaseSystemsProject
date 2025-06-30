'use client';

import React from 'react';
import {
    Container,
    Typography,
    Grid,
    Box,
    Paper,
    Button,
} from '@mui/material';
import { ArrowBack, ShoppingCart } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import Layout from '@/components/layout';
import type { CartItem as CartItemType } from '@/types/cart';

const CartPage: React.FC = () => {
    const router = useRouter();
    const { cart, getCartItemCount } = useCart();

    const handleCheckout = async () => {
        if (!cart || !cart.items.length) return;
        // Fetch user email
        let email = '';
        try {
            const res = await fetch('/api/profile');
            if (res.ok) {
                const data = await res.json();
                email = data.email;
            }
        } catch (e) {
            console.error('Failed to fetch user profile', e);
        }
        if (!email) {
            alert('Could not get user email. Please log in again.');
            return;
        }
        // Prepare order data
        const orderData = {
            email,
            total: cart.totalAmount,
            status: 'Pending',
            games: cart.items.map((item: CartItemType) => ({
                gameId: item.productId,
                title: item.title,
                quantity: item.quantity,
                price: item.price
            }))
        };
        
        // Send order to API
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            if (res.ok) {
                // Clear cart and redirect
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('customer-cart');
                }
                router.push('/my-orders');
            } else {
                alert('Failed to place order.');
            }
        } catch (e) {
            alert('Failed to place order.');
        }
    };

    const handleContinueShopping = () => {
        router.push('/products');
    };

    const itemCount = getCartItemCount();

    return (
        <Layout>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box display="flex" alignItems="center" mb={3}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={handleContinueShopping}
                        sx={{ mr: 2 }}
                    >
                        Continue Shopping
                    </Button>
                    <Typography variant="h5" component="h3">
                        Shopping Cart ({itemCount} items)
                    </Typography>
                </Box>

                {!cart || itemCount === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h5" gutterBottom>
                            Your cart is empty
                        </Typography>
                        <Typography color="text.secondary" paragraph>
                            Add some items to your cart to get started.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleContinueShopping}
                            size="large"
                        >
                            Start Shopping
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        <Grid size={{
                            xs: 12,
                            md: 8,
                        }}>
                            <Box>
                                {cart.items.map((item: CartItemType, index: number) => (
                                    <CartItem key={`${item.productId}-${index}`} item={item} />
                                ))}
                            </Box>
                        </Grid>

                        <Grid size={{
                            xs: 12,
                            md: 4,
                        }}>
                            <CartSummary onCheckout={handleCheckout} />
                        </Grid>
                    </Grid>
                )}
            </Container>
        </Layout>
    );
};

export default CartPage;
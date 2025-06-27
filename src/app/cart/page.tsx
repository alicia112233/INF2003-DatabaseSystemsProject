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

const CartPage: React.FC = () => {
    const router = useRouter();
    const { cart, getCartItemCount } = useCart();

    const handleCheckout = () => {
        // Implement checkout logic here
        console.log('Proceeding to checkout...');
        // router.push('/checkout');
    };

    const handleContinueShopping = () => {
        router.push('/products'); // Adjust path as needed
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
                                {cart.items.map((item) => (
                                    <CartItem key={item.id} item={item} />
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
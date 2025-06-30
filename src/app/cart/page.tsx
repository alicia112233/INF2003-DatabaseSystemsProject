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
    const { cart, getCartItemCount, clearCart } = useCart();

    const handleCheckout = async () => {
        if (!cart || !cart.items.length) {
            alert('Your cart is empty');
            return;
        }
        
        // Fetch user email
        let email = '';
        try {
            const res = await fetch('/api/profile', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (res.ok) {
                const data = await res.json();
                email = data.email;
            } else {
                alert('Authentication failed. Please log in again.');
                return;
            }
        } catch (e) {
            alert('Network error. Please check your connection and try again.');
            return;
        }
        
        if (!email) {
            alert('Could not get user email. Please log in again.');
            return;
        }

        // Separate purchase and rental items
        const purchaseItems = cart.items.filter(item => item.type !== 'rental');
        const rentalItems = cart.items.filter(item => item.type === 'rental');

        try {
            // Process purchases if any
            if (purchaseItems.length > 0) {
                const orderData = {
                    email,
                    total: purchaseItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                    status: 'Pending',
                    games: purchaseItems.map(item => ({
                        gameId: item.productId,
                        title: item.title,
                        quantity: item.quantity,
                        price: item.price
                    }))
                };

                const orderRes = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(orderData)
                });
                
                if (!orderRes.ok) {
                    const errorText = await orderRes.text();
                    throw new Error(`Failed to place order: ${orderRes.status} ${errorText}`);
                }
            }

            // Process rentals if any
            if (rentalItems.length > 0) {
                for (const rentalItem of rentalItems) {
                    const rentalData = {
                        gameId: rentalItem.productId,
                        days: rentalItem.rentalDays || 1,
                    };

                    const rentalRes = await fetch('/api/rentals/user', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify(rentalData)
                    });
                    
                    if (!rentalRes.ok) {
                        const errorText = await rentalRes.text();
                        throw new Error(`Failed to create rental for ${rentalItem.title}: ${rentalRes.status} ${errorText}`);
                    }
                }
            }

            // Clear cart and redirect
            clearCart();
            if (typeof window !== 'undefined') {
                localStorage.removeItem('customer-cart');
            }

            // Redirect based on what was processed
            if (rentalItems.length > 0 && purchaseItems.length > 0) {
                alert('Order placed and rentals created successfully!');
                router.push('/my-orders');
            } else if (rentalItems.length > 0) {
                alert('Rentals created successfully!');
                router.push('/my-rentals');
            } else {
                alert('Order placed successfully!');
                router.push('/my-orders');
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Failed to complete checkout: ${errorMessage}`);
        }
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
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Box>
                                {cart.items.map((item) => (
                                    <CartItem key={item.id} item={item} />
                                ))}
                            </Box>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <CartSummary onCheckout={handleCheckout} />
                        </Grid>
                    </Grid>
                )}
            </Container>
        </Layout>
    );
};

export default CartPage;
'use client';

import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Button,
    Stack,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import { useParams } from 'next/navigation';
import Layout from '@/components/layout';
import ReviewComponent from '@/components/reviews/ReviewComponent';
import AddToCartButton from '@/components/cart/AddToCartButton';
import RentButton from '@/components/products/RentButton';
import WishlistButton from '@/components/wishlist/WishlistButton';
import { Product } from '@/types/cart';

const ProductDetail = () => {
    const params = useParams();
    const productId = params.id as string;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' as 'success' | 'error' | 'warning' });

    useEffect(() => {
        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/games/${productId}`);
            if (!response.ok) {
                throw new Error('Product not found');
            }
            const data = await response.json();
            setProduct(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch product');
        } finally {
            setLoading(false);
        }
    };

    // Function to check if user is customer (not admin)
    const isCustomer = () => {
        if (typeof window === 'undefined') return false;
        const userRole = localStorage.getItem('userRole') || (
            document.cookie.match(/userRole=([^;]+)/)?.[1] || ''
        );
        return userRole !== 'admin';
    };

    if (loading) {
        return (
            <Layout>
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                        <CircularProgress />
                    </Box>
                </Container>
            </Layout>
        );
    }

    if (error || !product) {
        return (
            <Layout>
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Box sx={{ textAlign: 'center', mt: 6 }}>
                        <Alert severity="error">
                            {error || 'Product not found'}
                        </Alert>
                    </Box>
                </Container>
            </Layout>
        );
    }

    const isOutOfStock = product.stockCount === 0;
    const originalPrice = product.price || 0;
    const hasPromotion = Boolean(
        product.promotion && 
        (product.promotion.discountValue != null) && 
        product.promotion.discountType
    );

    const getDiscountedPrice = () => {
        if (!hasPromotion) {
            return originalPrice;
        }

        const { discountType, discountValue } = product.promotion!;

        let calculatedPrice = originalPrice;

        if (discountType === 'percentage') {
            calculatedPrice = originalPrice - (originalPrice * discountValue / 100);
        } else if (discountType === 'fixed') {
            calculatedPrice = originalPrice - discountValue;
        }
        
        return Math.max(calculatedPrice, 0);
    };

    const discountedPrice = getDiscountedPrice();

    return (
        <Layout>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box 
                    display="grid" 
                    gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }} 
                    gap={4}
                >
                    <Card>
                        <CardMedia
                            component="img"
                            height="400"
                            image={product.image_url || '/images/products/noprodimg.png'}
                            alt={product.title}
                            sx={{ objectFit: 'cover' }}
                        />
                    </Card>
                    
                    <Box sx={{ position: 'relative' }}>
                        {hasPromotion && (
                            <Chip
                                label="ON SALE"
                                color="warning"
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    fontWeight: 'bold',
                                }}
                            />
                        )}
                            
                        <Typography variant="h4" gutterBottom>
                            {product.title}
                        </Typography>
                        
                        {product.genreNames && product.genreNames.length > 0 && (
                            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {product.genreNames.map((genre, index) => (
                                    <Chip
                                        key={index}
                                        label={genre}
                                        size="small"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        )}
                        
                        <Typography variant="body1" paragraph>
                            {product.description || 'No description available'}
                        </Typography>
                        
                        <Box sx={{ mb: 3 }}>
                            {hasPromotion && originalPrice > discountedPrice ? (
                                <>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography
                                            variant="h6"
                                            color="text.secondary"
                                            sx={{ textDecoration: 'line-through' }}
                                        >
                                            ${originalPrice.toFixed(2)}
                                        </Typography>
                                        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                                            ${discountedPrice.toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 'medium' }}>
                                        Save ${(originalPrice - discountedPrice).toFixed(2)}
                                    </Typography>
                                </>
                            ) : (
                                <Typography variant="h4" color="primary">
                                    ${originalPrice.toFixed(2)}
                                </Typography>
                            )}
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                            {!isOutOfStock ? (
                                <Chip label={`In Stock (${product.stockCount || 0})`} color="success" />
                            ) : (
                                <Chip label="Out of Stock" color="error" />
                            )}
                        </Box>
                        
                        {isCustomer() && (
                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <AddToCartButton
                                        product={product}
                                        variant={!isOutOfStock ? 'contained' : 'outlined'}
                                        disabled={isOutOfStock}
                                        buttonText={isOutOfStock ? 'No Stock' : 'Add to Cart'}
                                        onSuccess={(message) => setSnack({ open: true, msg: message, severity: 'success' })}
                                        onWarning={(message) => setSnack({ open: true, msg: message, severity: 'warning' })}
                                        onError={(message) => setSnack({ open: true, msg: message, severity: 'error' })}
                                    />
                                    <WishlistButton product={product} />
                                </Box>
                                
                                {!isOutOfStock && (
                                    <RentButton
                                        product={product}
                                        variant="outlined"
                                        onSuccess={(message) => setSnack({ open: true, msg: message, severity: 'success' })}
                                        onWarning={(message) => setSnack({ open: true, msg: message, severity: 'warning' })}
                                        onError={(message) => setSnack({ open: true, msg: message, severity: 'error' })}
                                    />
                                )}
                            </Stack>
                        )}
                    </Box>
                </Box>
                
                {/* Reviews Section */}
                <ReviewComponent gameId={productId} gameTitle={product.title} />
                
                {/* Snackbar */}
                <Snackbar
                    open={snack.open}
                    autoHideDuration={6000}
                    onClose={() => setSnack(prev => ({ ...prev, open: false }))}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert severity={snack.severity} onClose={() => setSnack(prev => ({ ...prev, open: false }))}>
                        {snack.msg}
                    </Alert>
                </Snackbar>
            </Container>
        </Layout>
    );
};

export default ProductDetail;

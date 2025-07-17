'use client';

import { useState } from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
} from '@mui/material';
import AddToCartButton from '@/components/cart/AddToCartButton';
import { Product } from '@/types/cart';
import WishlistButton from '../wishlist/WishlistButton';
import RentButton from './RentButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const isOutOfStock = product.stockCount === 0; 
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) 
            return text;
        return text.slice(0, maxLength) + '...';
    };

    // Function to check if user is customer (not admin)
    const isCustomer = () => {
        if (typeof window === 'undefined') return false;
        const userRole = localStorage.getItem('userRole') || (
            document.cookie.match(/userRole=([^;]+)/)?.[1] || ''
        );
        return userRole !== 'admin';
    };
    
    const getGenres = () => {
        if (!product.genreNames || !Array.isArray(product.genreNames)) return [];
        return product.genreNames;
    };

    const genres = getGenres();

    // Ensure originalPrice is always a number
    const originalPrice = product.price || 0;

    // Check for promotion
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
        
        // Ensure price doesn't go below zero
        return Math.max(calculatedPrice, 0);
    };

    const discountedPrice = getDiscountedPrice();

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <Snackbar
                open={snack.open}
                autoHideDuration={3000}
                onClose={() => setSnack({ ...snack, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity={snack.severity as any} sx={{ width: '100%' }}>
                    {snack.msg}
                </Alert>
            </Snackbar>

            <Box sx={{ 
                position: 'absolute', 
                top: 8, 
                right: 8, 
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 1,
                background: 'none',
                boxShadow: 'none',
                border: 'none',
            }}>
                {isCustomer() && <WishlistButton product={product} />}
            </Box>
            
            {hasPromotion && (
                <Chip
                    label="ON SALE"
                    color="warning"
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        zIndex: 1000,
                        fontWeight: 'bold',
                    }}
                />
            )}

            <CardMedia
                component="img"
                height="200"
                image={product.image_url || '/images/products/noprodimg.png'}
                alt={product.title}
            />

            <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                    {product.title}
                </Typography>

                {genres.length > 0 && (
                    <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {genres.map((genre, index) => (
                            <Chip
                                key={index}
                                label={genre}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                    fontSize: '0.75rem',
                                    height: '24px',
                                }}
                            />
                        ))}
                    </Box>
                )}

                <Typography variant="body2" color="text.secondary" paragraph>
                    {product.description ? truncateText(product.description, 100) : ''}
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
                        {hasPromotion && originalPrice > discountedPrice ? (
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ textDecoration: 'line-through' }}
                                    >
                                        ${originalPrice.toFixed(2)}
                                    </Typography>
                                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                                        ${discountedPrice.toFixed(2)}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="success.main" sx={{ fontWeight: 'medium' }}>
                                    Save ${(originalPrice - discountedPrice).toFixed(2)}
                                </Typography>
                            </>
                        ) : (
                            <Typography variant="h6" color="primary">
                                ${originalPrice.toFixed(2)}
                            </Typography>
                        )}
                    </Box>

                    {/* Use stockCount for displaying stock status */}
                    {/* {!isOutOfStock ? (
                        <Chip label={`In Stock (${product.stockCount || 0})`} color="success" size="small" />
                    ) : (
                        <Chip label="Out of Stock" color="error" size="small" />
                    )} */}
                </Box>
            </CardContent>

            <Box sx={{ p: 2, pt: 0 }}>
                <AddToCartButton
                    product={product}
                    fullWidth
                    variant={!isOutOfStock ? 'contained' : 'outlined'}
                    disabled={isOutOfStock}
                    buttonText={isOutOfStock ? 'No Stock' : 'Add to Cart'}
                />
                {/* Rent Button - only show if game is in stock */}
                {!isOutOfStock && (
                    <RentButton
                        product={product}
                        fullWidth
                        variant="outlined"
                    />
                )}
                {/* See Reviews Button - always show */}
                <Box mt={1}>
                    <a
                        href={`/game/${product.id}`}
                        style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'center',
                            background: '#1976d2',
                            color: 'white',
                            padding: '10px 0',
                            borderRadius: '6px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            marginTop: 8,
                        }}
                        aria-label="See reviews for this game"
                    >
                        SEE REVIEWS
                    </a>
                </Box>
            </Box>
        </Card>
    );
};

export default ProductCard;
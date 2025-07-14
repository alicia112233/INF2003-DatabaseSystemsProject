'use client';

import React from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
    Button,
} from '@mui/material';
import AddToCartButton from '@/components/cart/AddToCartButton';
import { Product } from '@/types/cart';
import WishlistButton from '../wishlist/WishlistButton';
import RentButton from './RentButton';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const isOutOfStock = product.inStock === false;

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) 
            return text;
        return text.slice(0, maxLength) + '...';
    };

    // Function to get genres as an array
    const getGenres = () => {
        if (!product.genreNames || !Array.isArray(product.genreNames)) return [];
        return product.genreNames;
    };

    const genres = getGenres();

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
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
                <WishlistButton product={product} />
            </Box>
                
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
                    <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                        ${typeof product.price === 'string' ? parseFloat(product.price).toFixed(2) : product.price.toFixed(2)}
                    </Typography>

                    {!isOutOfStock ? (
                        <Chip label="In Stock" color="success" size="small" />
                    ) : (
                        <Chip label="Out of Stock" color="error" size="small" />
                    )}
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
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  sx={{ mt: 1 }}
                  href={`/game/${product.id}`}
                >
                  See Details
                </Button>
            </Box>
        </Card>
    );
};

export default ProductCard;
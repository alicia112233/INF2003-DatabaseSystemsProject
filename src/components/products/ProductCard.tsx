'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import AddToCartButton from '@/components/cart/AddToCartButton';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  category?: string;
  inStock?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const isOutOfStock = product.inStock === false;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={product.image || '/images/products/noprodimg.png'}
        alt={product.name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {product.name}
        </Typography>
        
        {product.category && (
          <Chip 
            label={product.category} 
            size="small" 
            sx={{ mb: 1 }} 
          />
        )}
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {product.description}
        </Typography>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Typography variant="h6" color="primary">
            ${product.price.toFixed(2)}
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
      </Box>
    </Card>
  );
};

export default ProductCard;
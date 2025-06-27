'use client';

import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    IconButton,
    Box,
    TextField,
    CardMedia,
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { CartItem as CartItemType } from '@/types/cart';
import { useCart } from '@/contexts/CartContext';

interface CartItemProps {
    item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1) {
            updateQuantity(item.id, newQuantity);
        }
    };

    const handleRemove = () => {
        removeFromCart(item.id);
    };

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                    <CardMedia
                        component="img"
                        sx={{ width: 60, height: 60, borderRadius: 1 }}
                        image={item.image_url || '/images/products/noprodimg.png'}
                        alt={item.title}
                        onError={(e) => {
                            console.log('Image failed to load:', item.image_url);
                            e.currentTarget.src = '/images/products/noprodimg.png';
                        }}
                    />

                    <Box flex={1}>
                        <Typography variant="h6" component="div">
                            {item.title}
                        </Typography>
                        {/* {item.description && (
                            <Typography variant="body2" color="text.secondary">
                                {item.description}
                            </Typography>
                        )} */}
                        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                            ${typeof item.price === 'string' ? parseFloat(item.price).toFixed(2) : item.price.toFixed(2)}
                        </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap={1}>
                        <IconButton
                            onClick={() => handleQuantityChange(item.quantity - 1)}
                            size="small"
                        >
                            <Remove />
                        </IconButton>

                        <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                            inputProps={{ min: 1, style: { textAlign: 'center' } }}
                            sx={{ width: 60 }}
                            size="small"
                        />

                        <IconButton
                            onClick={() => handleQuantityChange(item.quantity + 1)}
                            size="small"
                        >
                            <Add />
                        </IconButton>
                    </Box>

                    <Box textAlign="right" minWidth={80}>
                        <Typography variant="h6">
                            ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                    </Box>

                    <IconButton onClick={handleRemove} color="error">
                        <Delete />
                    </IconButton>
                </Box>
            </CardContent>
        </Card>
    );
};

export default CartItem;
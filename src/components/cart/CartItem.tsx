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

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) 
            return text;
        return text.slice(0, maxLength) + '...';
    };
    
    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1) {
            updateQuantity(item.id, newQuantity);
        }
    };

    const handleRemove = () => {
        removeFromCart(item.id);
    };

    // Fix price handling - ensure we always have a valid number
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

    const unitPrice = getValidPrice(item.price);
    const quantity = getValidQuantity(item.quantity);
    const totalPrice = unitPrice * quantity;

    console.log('Cart item data:', {
        id: item.id,
        title: item.title,
        price: item.price,
        priceType: typeof item.price,
        quantity: item.quantity,
        quantityType: typeof item.quantity
    });

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
                        {item.type === 'rental' && (
                            <Typography variant="body2" color="success.main" fontWeight="bold">
                                Rental: {item.rentalDays} day{item.rentalDays && item.rentalDays > 1 ? 's' : ''} @ ${getValidPrice(item.dailyRate).toFixed(2)}/day
                            </Typography>
                        )}
                        {item.description && (
                            <Typography variant="body2" color="text.secondary">
                                {truncateText(item.description, 80)}
                            </Typography>
                        )}
                        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                            ${unitPrice.toFixed(2)}
                        </Typography>
                    </Box>

                    {/* Quantity controls - only for purchase items */}
                    {item.type !== 'rental' ? (
                        <Box display="flex" alignItems="center" gap={1}>
                            <IconButton
                                onClick={() => handleQuantityChange(quantity - 1)}
                                size="small"
                            >
                                <Remove />
                            </IconButton>

                            <TextField
                                type="number"
                                value={quantity}
                                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                inputProps={{ min: 1, style: { textAlign: 'center' } }}
                                sx={{ width: 60 }}
                                size="small"
                            />

                            <IconButton
                                onClick={() => handleQuantityChange(quantity + 1)}
                                size="small"
                            >
                                <Add />
                            </IconButton>
                        </Box>
                    ) : (
                        <Box display="flex" alignItems="center" minWidth={120} justifyContent="center">
                            <Typography variant="body2" color="text.secondary">
                                Rental Item
                            </Typography>
                        </Box>
                    )}

                    <Box textAlign="right" minWidth={80}>
                        <Typography variant="h6">
                            ${totalPrice.toFixed(2)}
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
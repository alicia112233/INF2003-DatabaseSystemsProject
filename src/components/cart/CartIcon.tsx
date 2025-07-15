'use client';

import React from 'react';
import { IconButton, Badge } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

const CartIcon: React.FC = () => {
    const router = useRouter();
    const { getCartItemCount } = useCart();

    const itemCount = getCartItemCount();

    const handleCartClick = () => {
        router.push('/cart');
    };

    return (
        <IconButton onClick={handleCartClick} color="inherit">
            <Badge badgeContent={itemCount} color="error">
                <ShoppingCart />
            </Badge>
        </IconButton>
    );
};

export default CartIcon;
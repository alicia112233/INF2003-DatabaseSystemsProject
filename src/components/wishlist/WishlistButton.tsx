'use client';

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { Product } from '@/types/cart';
import { useWishlist } from '@/contexts/WishlistContext';

interface WishlistButtonProps {
    product: Product;
    size?: 'small' | 'medium' | 'large';
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ product, size = 'medium' }) => {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const inWishlist = isInWishlist(product.id);

    const handleToggleWishlist = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click events

        if (inWishlist) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist({
                id: product.id,
                title: product.title,
                description: product.description,
                price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                image_url: product.image_url,
            });
        }
    };

    return (
        <Tooltip title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}>
            <IconButton
                onClick={handleToggleWishlist}
                size={size}
                sx={{
                    color: inWishlist ? 'warning.main' : 'action.disabled',
                    '&:hover': {
                        color: 'warning.main',
                    },
                }}
            >
                {inWishlist ? <Star /> : <StarBorder />}
            </IconButton>
        </Tooltip>
    );
};

export default WishlistButton;
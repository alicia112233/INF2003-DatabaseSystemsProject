'use client';

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { Product } from '@/types/cart';
import { useWishlist } from '@/contexts/WishlistContext';
import { useSnackbar } from '@/contexts/SnackbarContext';

interface WishlistButtonProps {
    product: Product;
    size?: 'small' | 'medium' | 'large';
}

function isUserLoggedInAndCustomer(): boolean {
    if (typeof window === 'undefined') return false;
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || document.cookie.includes('isLoggedIn=true');
    const userRole = localStorage.getItem('userRole') || (document.cookie.match(/userRole=([^;]+)/)?.[1] || '');
    return isLoggedIn && userRole === 'customer';
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ product, size = 'medium' }) => {
    const { removeFromWishlist, addToWishlist, isInWishlist } = useWishlist();
    const inWishlist = isInWishlist(product.id.toString());
    const { showSnackbar } = useSnackbar();

    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!isUserLoggedInAndCustomer()) {
            showSnackbar('Please log in to add to wishlist.', 'warning');
            return;
        }

        if (inWishlist) {
            await removeFromWishlist(product.id.toString());
            showSnackbar('Removed from wishlist', 'success');
        } else {
            const result = await addToWishlist(product); 
            showSnackbar(result.message, result.success ? 'success' : 'warning');
        }
    };

    return (
        <>
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
        </>
    );
};

export default WishlistButton;
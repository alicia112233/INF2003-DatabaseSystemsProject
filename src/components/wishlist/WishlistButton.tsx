'use client';

import React, { useState } from 'react';
import { IconButton, Tooltip, Snackbar, Alert } from '@mui/material';
import { Star, StarBorder } from '@mui/icons-material';
import { Product } from '@/types/cart';
import { useWishlist } from '@/contexts/WishlistContext';

type WishlistActionResult = { success: boolean; message: string };

interface WishlistButtonProps {
    product: Product;
    size?: 'small' | 'medium' | 'large';
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ product, size = 'medium' }) => {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const inWishlist = isInWishlist(product.id);
    const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (inWishlist) {
            await removeFromWishlist(product.id);
            setSnack({ open: true, msg: 'Removed from wishlist', severity: 'success' });
        } else {
            // Directly call the API and check the response
            const res = await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameId: product.id }),
            });
            const data = await res.json();
            setSnack({
                open: true,
                msg: data.message === 'Already in wishlist' ? 'Already in wishlist' : 'Added to wishlist',
                severity: data.message === 'Already in wishlist' ? 'warning' : 'success',
            });
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
            <Snackbar
                open={snack.open}
                autoHideDuration={3000}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity as any}>
                    {snack.msg}
                </Alert>
            </Snackbar>
        </>
    );
};

export default WishlistButton;
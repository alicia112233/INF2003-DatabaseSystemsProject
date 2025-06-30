'use client';

import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { useCart } from '@/contexts/CartContext';
import { Product, Game, gameToProduct, productToCartItem } from '@/types/cart';

interface AddToCartButtonProps extends Omit<ButtonProps, 'onClick' | 'onWarning' | 'onError'> {
    product: Product | Game | any;
    buttonText?: string;
    onSuccess?: (message: string) => void;
    onWarning?: (message: string) => void;
    onError?: (message: string) => void;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
    product,
    buttonText = 'Add to Cart',
    disabled,
    onSuccess,
    onWarning,
    onError,
    ...buttonProps
}) => {
    const { addToCart } = useCart();

    // Function to check if user is logged in
    const isUserLoggedInAndCustomer = () => {
        if (typeof window === 'undefined') return false;
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || document.cookie.includes('isLoggedIn=true');
        const userRole = localStorage.getItem('userRole') || (
            document.cookie.match(/userRole=([^;]+)/)?.[1] || ''
        );
        return isLoggedIn && userRole === 'customer';
    };

    const handleAddToCart = async () => {
        // Check if user is logged in
        if (!isUserLoggedInAndCustomer()) {
            if (onWarning) {
                onWarning('Please log in to add to cart.');
            }
            return;
        }

        if (product.inStock !== false && !disabled) {
            try {
                // Convert to Product format if needed
                let productData: Product;
                
                // Check if it's already a Product or needs conversion from Game
                if (product.genreNames !== undefined || product.genres !== undefined) {
                    // It's likely a Game object, convert it
                    productData = gameToProduct(product);
                } else {
                    // Assume it's already a Product
                    productData = product as Product;
                }
                
                // Create cart item
                const cartItem = productToCartItem(productData, 1);
                
                // Use context method - it will handle localStorage automatically
                addToCart(cartItem);

                if (onSuccess) {
                    onSuccess('Added to cart successfully!');
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
                if (onError) {
                    onError('Failed to add to cart. Please try again.');
                }
            }
        }
    };

    return (
        <Button
            {...buttonProps}
            onClick={handleAddToCart}
            disabled={disabled || product.inStock === false}
        >
            {buttonText}
        </Button>
    );
};

export default AddToCartButton;
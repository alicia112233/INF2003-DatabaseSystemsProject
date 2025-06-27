'use client';

import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types/cart';

interface AddToCartButtonProps extends Omit<ButtonProps, 'onClick'> {
  product: Product;
  buttonText?: string;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({ 
  product, 
  buttonText = 'Add to Cart',
  disabled,
  ...buttonProps 
}) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (product.inStock !== false && !disabled) {
      addToCart({
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
        image_url: product.image_url || '/images/products/noprodimg.png',
        description: product.description,
      });
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
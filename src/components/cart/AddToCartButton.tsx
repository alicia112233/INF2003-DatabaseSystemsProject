'use client';

import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  category?: string;
  inStock?: boolean;
}

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
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
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
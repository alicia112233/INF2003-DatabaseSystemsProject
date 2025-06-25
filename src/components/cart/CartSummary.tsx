'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Box,
} from '@mui/material';
import { useCart } from '@/contexts/CartContext';

interface CartSummaryProps {
  onCheckout?: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({ onCheckout }) => {
  const { cart, getCartTotal, getCartItemCount, clearCart } = useCart();

  const itemCount = getCartItemCount();
  const total = getCartTotal();
  const tax = total * 0.1; // 10% tax
  const finalTotal = total + tax;

  if (!cart || itemCount === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cart Summary
          </Typography>
          <Typography color="text.secondary">
            Your cart is empty
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Cart Summary
        </Typography>
        
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography>Items ({itemCount})</Typography>
          <Typography>${total.toFixed(2)}</Typography>
        </Box>
        
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography>Tax (10%)</Typography>
          <Typography>${tax.toFixed(2)}</Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h6">Total</Typography>
          <Typography variant="h6">${finalTotal.toFixed(2)}</Typography>
        </Box>
        
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={onCheckout}
          sx={{ mb: 1 }}
        >
          Proceed to Checkout
        </Button>
        
        <Button
          variant="outlined"
          fullWidth
          onClick={clearCart}
          color="error"
        >
          Clear Cart
        </Button>
      </CardContent>
    </Card>
  );
};

export default CartSummary;
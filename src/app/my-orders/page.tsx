"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Container,
  TableContainer,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Snackbar,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import Layout from '@/components/layout';
import { format } from 'date-fns';

interface Game {
  game_id: number; // Changed from gameId to match API response
  title: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: number;
  email: string;
  total: number;
  createdAt: string;
  promotion_code?: string; // Add promotion code field
  games: Game[];
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ games: [] as Game[] });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Fetch user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (response.ok) {
          const data = await response.json();
          console.log('Orders data received:', data); // Debug log
          // Sort orders by date (latest first)
          const sortedOrders = data.sort((a: Order, b: Order) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setOrders(sortedOrders);
        } else {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // View order details
  const handleView = (order: Order) => {
    console.log('Viewing order:', order); // Debug log
    setSelectedOrder(order);
    setOpen(true);
    setEditMode(false);
  };

  // Edit order (removed status editing since digital purchases don't need status)
  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setForm({ games: order.games });
    setOpen(true);
    setEditMode(true);
  };

  // Save order (simplified since no status to update)
  const handleSave = async () => {
    if (!selectedOrder) return;
    // For digital purchases, there's nothing to update
    setOpen(false);
    setEditMode(false);
    setSelectedOrder(null);
  };

  // Delete order
  const handleDelete = async (orderId: number) => {
    await fetch(`/api/orders?id=${orderId}`, {
      method: "DELETE",
    });
    // Refresh orders
    const response = await fetch("/api/orders");
    if (response.ok) {
      const data = await response.json();
      // Sort orders by date (latest first)
      const sortedOrders = data.sort((a: Order, b: Order) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setOrders(sortedOrders);
    }
  };

  // Cancel dialog
  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedOrder(null);
  };

  // Cancel a specific game from an order
  const handleCancelGame = async (orderId: number, gameId: number) => {
    try {
      const response = await fetch('/api/orders/cancel-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, gameId }),
      });

      if (response.ok) {
        const result = await response.json();
        setSnackbar({ 
          open: true, 
          message: result.message || 'Game cancelled successfully', 
          severity: 'success' 
        });
        
        // Refresh orders to get updated data
        const ordersResponse = await fetch("/api/orders");
        if (ordersResponse.ok) {
          const data = await ordersResponse.json();
          // Sort orders by date (latest first)
          const sortedOrders = data.sort((a: Order, b: Order) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setOrders(sortedOrders);
          
          // Update the selected order if it's currently open
          if (selectedOrder && selectedOrder.id === orderId) {
            const updatedOrder = sortedOrders.find((order: Order) => order.id === orderId);
            if (updatedOrder) {
              setSelectedOrder(updatedOrder);
            }
          }
        }
      } else {
        const error = await response.json();
        setSnackbar({ 
          open: true, 
          message: error.error || 'Failed to cancel game', 
          severity: 'error' 
        });
      }
    } catch (error) {
      console.error('Error cancelling game:', error);
      setSnackbar({ 
        open: true, 
        message: 'An error occurred while cancelling the game', 
        severity: 'error' 
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Orders
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {orders.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              You haven't placed any orders yet.
            </Typography>
            <Button variant="contained" href="/products" sx={{ mt: 2 }}>
              Browse Games
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Games</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Promotion</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders
                  .filter(order => order.games && order.games.length > 0) // Filter out orders with no games
                  .map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Box>
                        {order.games.map((game, index) => (
                          <Box key={index} display="flex" alignItems="center" gap={1} mb={index < order.games.length - 1 ? 1 : 0}>
                            <Typography variant="body2">
                              {game.title} (x{game.quantity})
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                    <TableCell>
                      {order.promotion_code ? (
                        <Chip 
                          label={order.promotion_code}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleView(order)}
                        sx={{ mr: 1 }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Order Details Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>Order Details</DialogTitle>
          <DialogContent>
            {selectedOrder ? (
              <>
                <Typography variant="subtitle1" gutterBottom>Order ID: #{selectedOrder.id}</Typography>
                <Typography variant="body2" gutterBottom>Total: ${Number(selectedOrder.total || 0).toFixed(2)}</Typography>
                <Typography variant="body2" gutterBottom>
                  Order Date: {selectedOrder.createdAt ? format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy') : '-'}
                </Typography>
                {selectedOrder.promotion_code && (
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Promotion Applied:
                    </Typography>
                    <Chip 
                      label={selectedOrder.promotion_code}
                      color="success"
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                )}
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Games Purchased:</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Game ID</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Subtotal</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.games && Array.isArray(selectedOrder.games) && selectedOrder.games.length > 0 ? (
                        selectedOrder.games.map((game, i) => (
                          <TableRow key={i}>
                            <TableCell>{game.game_id}</TableCell>
                            <TableCell>{game.title || 'Unknown Game'}</TableCell>
                            <TableCell>{game.quantity || 1}</TableCell>
                            <TableCell>${Number(game.price || 0).toFixed(2)}</TableCell>
                            <TableCell>${(Number(game.price || 0) * Number(game.quantity || 1)).toFixed(2)}</TableCell>
                            <TableCell>
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleCancelGame(selectedOrder.id, game.game_id)}
                                title="Cancel this game"
                              >
                                <CancelIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography color="text.secondary">No games in this order</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                <Typography color="text.secondary">No order details available</Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
}

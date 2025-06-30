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
} from "@mui/material";
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

  // Fetch user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (response.ok) {
          const data = await response.json();
          console.log('Orders data received:', data); // Debug log
          setOrders(data);
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
      setOrders(data);
    }
  };

  // Cancel dialog
  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedOrder(null);
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
                  <TableCell>Order ID</TableCell>
                  <TableCell>Games</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>
                      <Box>
                        {order.games && order.games.length > 0 ? (
                          order.games.map((game, index) => (
                            <Box key={index} display="flex" alignItems="center" gap={1} mb={index < order.games.length - 1 ? 1 : 0}>
                              <Typography variant="body2">
                                {game.title} (x{game.quantity})
                              </Typography>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">No games</Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>${Number(order.total).toFixed(2)}</TableCell>
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
                  Order Date: {selectedOrder.createdAt ? format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy HH:mm') : '-'}
                </Typography>
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
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
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
      </Container>
    </Layout>
  );
}

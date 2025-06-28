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
} from "@mui/material";

// Types
interface Game {
  gameId: number;
  title: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  email: string;
  total: number;
  status: string;
  createdAt: string;
  games: Game[];
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ status: "", games: [] as Game[] });

  // Fetch user's orders
  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

  // View order details
  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setOpen(true);
    setEditMode(false);
  };

  // Edit order status (for demo, only status is editable)
  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setForm({ status: order.status, games: order.games });
    setOpen(true);
    setEditMode(true);
  };

  // Save order status
  const handleSave = async () => {
    if (!selectedOrder) return;
    await fetch("/api/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedOrder.id, status: form.status, purchase_date: selectedOrder.createdAt }),
    });
    setOpen(false);
    setEditMode(false);
    setSelectedOrder(null);
    // Refresh orders
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data));
  };

  // Delete order
  const handleDelete = async (orderId: number) => {
    await fetch(`/api/orders?id=${orderId}`, {
      method: "DELETE",
    });
    // Refresh orders
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data));
  };

  // Cancel dialog
  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setSelectedOrder(null);
  };

  return (
    <Box minHeight="100vh" bgcolor="#f7f7f7" py={4}>
      <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
        <Box component="button" onClick={() => window.location.href = '/'} sx={{ background: 'none', border: 'none', p: 0, cursor: 'pointer' }}>
          <img src="/images/logos/game_haven_logo.png" alt="Game Haven Logo" style={{ height: 60, marginBottom: 8 }} />
        </Box>
        <Typography variant="h4" fontWeight={600} color="text.primary" mb={2}>
          My Orders
        </Typography>
      </Box>
      <Box display="flex" justifyContent="center">
        <Paper elevation={3} sx={{ maxWidth: 900, width: '100%', p: 4, borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Your Email</TableCell>
                <TableCell>Game Titles</TableCell>
                <TableCell>Total Price</TableCell>
                <TableCell>Date Ordered</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.email || "-"}</TableCell>
                  <TableCell>{order.games && order.games.length > 0 ? order.games.map(g => g.title).join(", ") : "-"}</TableCell>
                  <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                  <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</TableCell>
                  {/* No actions column */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? "Edit Order" : "Order Details"}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <>
              <Typography variant="subtitle1">Order ID: {selectedOrder.id}</Typography>
              <Typography variant="subtitle2" mb={1}>Status: {editMode ? (
                <TextField
                  select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  SelectProps={{ native: true }}
                  size="small"
                  sx={{ width: 120 }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </TextField>
              ) : selectedOrder.status}</Typography>
              <Typography variant="subtitle2" mb={1}>Total: ${selectedOrder.total.toFixed(2)}</Typography>
              <Typography variant="subtitle2" mb={1}>Created At: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : ""}</Typography>
              <Typography variant="subtitle2" mb={1}>Games:</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedOrder.games.map((g, i) => (
                    <TableRow key={i}>
                      <TableCell>{g.gameId}</TableCell>
                      <TableCell>{g.title}</TableCell>
                      <TableCell>{g.quantity}</TableCell>
                      <TableCell>${g.price.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
          {editMode && <Button onClick={handleSave} variant="contained">Save</Button>}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

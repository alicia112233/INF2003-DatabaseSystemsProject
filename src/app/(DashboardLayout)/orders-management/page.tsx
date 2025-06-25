"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const statusOptions = ["Pending", "Shipped", "Delivered", "Cancelled"];

type Order = {
  id: number;
  customer: string;
  email: string;
  gameTitle: string;
  total: number;
  status: string;
  createdAt: string;
};

type OrderForm = {
  customer: string;
  email: string;
  gameTitle: string;
  total: string;
  status: string;
};

const OrdersManagementPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [open, setOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [form, setForm] = useState<OrderForm>({
    customer: "",
    email: "",
    gameTitle: "",
    total: "",
    status: "Pending",
  });
  const [search, setSearch] = useState("");

  // Fetch orders
  const fetchOrders = async () => {
    const res = await fetch("/api/orders");
    setOrders(await res.json());
  };
  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update order
  const handleSubmit = async () => {
    if (editOrder) {
      await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id: editOrder.id,
          total: parseFloat(form.total),
        }),
      });
    } else {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, total: parseFloat(form.total) }),
      });
    }
    setOpen(false);
    setEditOrder(null);
    setForm({ customer: "", email: "", gameTitle: "", total: "", status: "Pending" });
    fetchOrders();
  };

  // Edit order
  const handleEdit = (order: Order) => {
    setEditOrder(order);
    setForm({
      customer: order.customer,
      email: order.email,
      gameTitle: order.gameTitle,
      total: order.total.toString(),
      status: order.status,
    });
    setOpen(true);
  };

  // Delete order
  const handleDelete = async (id: number) => {
    await fetch("/api/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchOrders();
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <h1>Orders Management</h1>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            placeholder="Search by customer, email, or game title"
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ minWidth: 300 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setOpen(true);
              setEditOrder(null);
              setForm({ customer: "", email: "", gameTitle: "", total: "", status: "Pending" });
            }}
          >
            Add Order
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Game Title</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders
              .filter(order =>
                order.customer.toLowerCase().includes(search.toLowerCase()) ||
                order.email.toLowerCase().includes(search.toLowerCase()) ||
                order.gameTitle.toLowerCase().includes(search.toLowerCase())
              )
              .map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.email}</TableCell>
                  <TableCell>{order.gameTitle}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>{order.createdAt}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(order)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(order.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editOrder ? "Edit Order" : "Add Order"}</DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            minWidth: 350,
          }}
        >
          <TextField
            label="Customer"
            name="customer"
            value={form.customer}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Game Title"
            name="gameTitle"
            value={form.gameTitle}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Total"
            name="total"
            type="number"
            value={form.total}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            fullWidth
          >
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
          >
            {editOrder ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersManagementPage;

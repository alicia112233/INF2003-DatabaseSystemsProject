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
import { format } from "date-fns";



type GameSelection = {
    gameId: number;
    title: string;
    quantity: number;
    price: number;
};

type Order = {
  id: number;
  email: string;
  games: GameSelection[];
  total: number;
  createdAt: string;
};

type OrderForm = {
  email: string;
  games: GameSelection[];
  total: string;
};

const OrdersManagementPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [open, setOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [form, setForm] = useState<OrderForm>({
    email: "",
    games: [],
    total: "",
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

    // Handlers for games
    const handleAddGame = () => {
        setForm((prev) => ({
            ...prev,
            games: [
                ...prev.games,
                { gameId: 0, title: "", quantity: 1, price: 0 },
            ],
        }));
    };

  const handleGameChange = <K extends keyof GameSelection>(idx: number, field: K, value: GameSelection[K]) => {
    setForm((prev) => {
      const games = [...prev.games];
      games[idx] = { ...games[idx], [field]: value };
      // recalculate total
      const total = games.reduce((sum, g) => sum + (Number(g.price) * Number(g.quantity)), 0);
      return { ...prev, games, total: total.toFixed(2) };
    });
  };

    const handleRemoveGame = (idx: number) => {
        setForm((prev) => ({
            ...prev,
            games: prev.games.filter((_, i) => i !== idx),
        }));
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
    setForm({ email: "", games: [], total: "" });
    fetchOrders();
  };

  // Edit order
  const handleEdit = (order: Order) => {
    setEditOrder(order);
    setForm({
      email: order.email,
      games: order.games || [],
      total: order.total.toString(),
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
            placeholder="Search by customer email or game title"
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
              setForm({ email: "", games: [], total: "", status: "Pending" });
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
              <TableCell>ID</TableCell>
              <TableCell>Customer Email</TableCell>
              <TableCell>Games</TableCell>
              <TableCell>Total</TableCell>
              {/* Status column removed */}
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders
              .filter(order =>
                order.email.toLowerCase().includes(search.toLowerCase()) ||
                (order.games?.map(g => g.title).join(", ").toLowerCase().includes(search.toLowerCase()))
              )
              .map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.email}</TableCell>
                  <TableCell>
                    {order.games && order.games.length > 0
                      ? order.games.map(g => `${g.title} (x${g.quantity})`).join(", ")
                      : "-"}
                  </TableCell>
                  <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                  {/* Status cell removed */}
                  <TableCell>{order.createdAt ? format(new Date(order.createdAt), "yyyy-MM-dd") : ""}</TableCell>
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
            label="Customer Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
          />
          {/* Games Section */}
          <Box>
            <Button
              variant="outlined"
              onClick={handleAddGame}
              sx={{ mb: 1 }}
            >
              Add Game
            </Button>
            {form.games.map((g, idx) => (
              <Box key={idx} display="flex" gap={1} alignItems="center" mb={1}>
                <TextField
                  label="Game ID"
                  type="number"
                  value={g.gameId}
                  onChange={e => handleGameChange(idx, "gameId", Number(e.target.value))}
                  sx={{ width: 90 }}
                />
                <TextField
                  label="Title"
                  value={g.title}
                  onChange={e => handleGameChange(idx, "title", e.target.value)}
                  sx={{ width: 120 }}
                />
                <TextField
                  label="Qty"
                  type="number"
                  value={g.quantity}
                  onChange={e => handleGameChange(idx, "quantity", Number(e.target.value))}
                  sx={{ width: 60 }}
                />
                <TextField
                  label="Price"
                  type="number"
                  value={g.price}
                  onChange={e => handleGameChange(idx, "price", Number(e.target.value))}
                  sx={{ width: 80 }}
                />
                <Button
                  color="error"
                  onClick={() => handleRemoveGame(idx)}
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Box>
          <TextField
            label="Total"
            name="total"
            type="number"
            value={form.total}
            onChange={handleChange}
            fullWidth
          />
          {/* Status field removed */}
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
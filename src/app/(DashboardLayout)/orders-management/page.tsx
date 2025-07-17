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
    Paper,
    Typography,
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

type GameFromAPI = {
    game_id: number;
    title: string;
    quantity: number;
    price: number;
};

type Order = {
    id: number;
    email: string;
    games: GameFromAPI[]; // API returns game_id format
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

    // Fetch game details by ID
    const fetchGameById = async (gameId: number) => {
        try {
            const response = await fetch(`/api/games`);
            const data = await response.json();
            const game = data.games?.find((g: any) => g.id == gameId);
            return game ? { title: game.title, price: game.price } : null;
        } catch (error) {
            console.error('Error fetching game:', error);
            return null;
        }
    };

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

    const handleGameChange = async <K extends keyof GameSelection>(idx: number, field: K, value: GameSelection[K]) => {
        setForm((prev) => {
            const games = [...prev.games];
            games[idx] = { ...games[idx], [field]: value };

            // If gameId is being updated, fetch game details
            if (field === 'gameId' && value && Number(value) > 0) {
                fetchGameById(Number(value)).then(gameDetails => {
                    if (gameDetails) {
                        setForm((prevForm) => {
                            const updatedGames = [...prevForm.games];
                            updatedGames[idx] = {
                                ...updatedGames[idx],
                                title: gameDetails.title,
                                price: gameDetails.price
                            };
                            // Recalculate total
                            const total = updatedGames.reduce((sum, g) => sum + (Number(g.price) * Number(g.quantity)), 0);
                            return { ...prevForm, games: updatedGames, total: total.toFixed(2) };
                        });
                    }
                });
            }

            // Recalculate total
            const total = games.reduce((sum, g) => sum + (Number(g.price) * Number(g.quantity)), 0);
            return { ...prev, games, total: total.toFixed(2) };
        });
    };

    const handleRemoveGame = (idx: number) => {
        setForm((prev) => {
            const newGames = prev.games.filter((_, i) => i !== idx);
            // Recalculate total after removing game
            const total = newGames.reduce((sum, g) => sum + (Number(g.price) * Number(g.quantity)), 0);
            return {
                ...prev,
                games: newGames,
                total: total.toFixed(2)
            };
        });
    };

    // Add or update order
    const handleSubmit = async () => {
        try {
            // Validate form data
            if (!form.email.trim()) {
                alert('Please enter a customer email');
                return;
            }
            
            if (!form.games || form.games.length === 0) {
                alert('Please add at least one game');
                return;
            }
            
            // Filter out invalid games
            const validGames = form.games.filter(game => {
                return game.gameId > 0 && 
                       game.title.trim() && 
                       game.quantity > 0 && 
                       game.price > 0;
            });
            
            if (validGames.length === 0) {
                alert('Please ensure all games have valid data (ID > 0, title, quantity > 0, price > 0)');
                return;
            }
            
            // Recalculate total based on valid games
            const recalculatedTotal = validGames.reduce((sum, g) => sum + (Number(g.price) * Number(g.quantity)), 0);
            
            const orderData = {
                email: form.email,
                games: validGames,
                total: recalculatedTotal,
            };
            
            console.log('Submitting order data:', orderData);
            
            if (editOrder) {
                const response = await fetch("/api/orders", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...orderData,
                        id: editOrder.id,
                    }),
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('PUT /api/orders error:', errorData);
                    alert(`Error updating order: ${errorData.error || 'Unknown error'}`);
                    return;
                }
                
                const result = await response.json();
                console.log('Order updated successfully:', result);
            } else {
                const response = await fetch("/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(orderData),
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('POST /api/orders error:', errorData);
                    alert(`Error creating order: ${errorData.error || 'Unknown error'}`);
                    return;
                }
                
                const result = await response.json();
                console.log('Order created successfully:', result);
            }
            
            setOpen(false);
            setEditOrder(null);
            setForm({ email: "", games: [], total: "" });
            fetchOrders();
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            alert('An unexpected error occurred. Please try again.');
        }
    };

    // Edit order
    const handleEdit = (order: Order) => {
        setEditOrder(order);
        
        // Transform the games data to match the expected format
        const transformedGames = order.games ? order.games.map(game => ({
            gameId: game.game_id, // Convert from API format
            title: game.title,
            quantity: game.quantity,
            price: game.price
        })) : [];
        
        setForm({
            email: order.email,
            games: transformedGames,
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
                            setForm({ email: "", games: [], total: "" });
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
                                            : "Cancelled"}
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
                        {form.games.map((g, idx) => {
                            const isGameValid = g.gameId > 0 && g.title.trim() && g.quantity > 0 && g.price > 0;
                            return (
                                <Box key={idx} display="flex" gap={1} alignItems="center" mb={1}>
                                    <TextField
                                        label="Game ID"
                                        type="number"
                                        value={g.gameId}
                                        onChange={e => handleGameChange(idx, "gameId", Number(e.target.value))}
                                        sx={{ width: 90 }}
                                        error={g.gameId <= 0}
                                        helperText={g.gameId <= 0 ? "Required" : ""}
                                    />
                                    <TextField
                                        label="Title"
                                        value={g.title}
                                        onChange={e => handleGameChange(idx, "title", e.target.value)}
                                        sx={{ width: 120 }}
                                        InputProps={{ readOnly: true }}
                                        placeholder="Auto-filled"
                                        error={!g.title.trim()}
                                    />
                                    <TextField
                                        label="Qty"
                                        type="number"
                                        value={g.quantity}
                                        onChange={e => handleGameChange(idx, "quantity", Number(e.target.value))}
                                        sx={{ width: 60 }}
                                        error={g.quantity <= 0}
                                        helperText={g.quantity <= 0 ? "Required" : ""}
                                    />
                                    <TextField
                                        label="Price"
                                        type="number"
                                        value={g.price}
                                        onChange={e => handleGameChange(idx, "price", Number(e.target.value))}
                                        sx={{ width: 80 }}
                                        InputProps={{ readOnly: true }}
                                        placeholder="Auto-filled"
                                        error={g.price <= 0}
                                    />
                                    <Button
                                        color="error"
                                        onClick={() => handleRemoveGame(idx)}
                                    >
                                        Remove
                                    </Button>
                                    {!isGameValid && (
                                        <Typography variant="caption" color="error">
                                            Incomplete
                                        </Typography>
                                    )}
                                </Box>
                            );
                        })}
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
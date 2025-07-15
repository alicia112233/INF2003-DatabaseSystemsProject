"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Menu,
    MenuItem,
    CircularProgress,
} from "@mui/material";

type OrderItem = {
    id: number;
    gameId: number;
    quantity: number;
    price: number;
};

type Order = {
    id: number;
    userId: number;
    createdAt: string;
    items: OrderItem[];
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [activeOrderId, setActiveOrderId] = useState<number | null>(null);

    const router = useRouter();

    useEffect(() => {
        async function fetchOrders() {
            try {
                const res = await fetch("/api/orders", { headers: { Authorization: "Bearer demo-token" } });
                const data = await res.json();
                if (res.ok) setOrders(data);
                else setError(data.error || "Failed to load orders");
            } catch (err) {
                setError("Failed to load orders");
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    const handleActionClick = (event: React.MouseEvent<HTMLButtonElement>, orderId: number) => {
        setAnchorEl(event.currentTarget);
        setActiveOrderId(orderId);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setActiveOrderId(null);
    };

    const handleView = () => {
        if (activeOrderId !== null) router.push(`/admin-dashboard/orders/${activeOrderId}`);
        handleClose();
    };
    const handleEdit = () => {
        if (activeOrderId !== null) router.push(`/admin-dashboard/orders/${activeOrderId}/edit`);
        handleClose();
    };
    const handleDelete = async () => {
        if (activeOrderId !== null) {
            await fetch(`/api/orders/${activeOrderId}`, { method: "DELETE", headers: { Authorization: "Bearer demo-token" } });
            setOrders(orders.filter(o => o.id !== activeOrderId));
        }
        handleClose();
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Orders Management
            </Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Items</TableCell>
                        <TableCell>Created At</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders.map(order => (
                        <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>{order.userId}</TableCell>
                            <TableCell>{order.items.length}</TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                            <TableCell>
                                <Button variant="contained" onClick={e => handleActionClick(e, order.id)}>
                                    Actions
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem onClick={handleView}>View</MenuItem>
                <MenuItem onClick={handleEdit}>Edit</MenuItem>
                <MenuItem onClick={handleDelete}>Delete</MenuItem>
            </Menu>
        </Box>
    );
}
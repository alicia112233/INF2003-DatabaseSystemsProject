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
  Chip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { format } from "date-fns";

const statusOptions = ["Active", "Returned", "Overdue", "Cancelled"];

type GameRental = {
  gameId: number;
  title: string;
  quantity: number;
  dailyRate: number;
};

type Rental = {
  id: number;
  customerEmail: string;
  games: GameRental[];
  totalCost: number;
  status: string;
  rentalDate: string;
  returnDate: string;
  actualReturnDate?: string;
  daysRented: number;
};

type RentalForm = {
  customerEmail: string;
  games: GameRental[];
  totalCost: string;
  status: string;
  rentalDate: string;
  returnDate: string;
  actualReturnDate: string;
  daysRented: string;
};

const RentalManagementPage = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [open, setOpen] = useState(false);
  const [editRental, setEditRental] = useState<Rental | null>(null);
  const [form, setForm] = useState<RentalForm>({
    customerEmail: "",
    games: [],
    totalCost: "",
    status: "Active",
    rentalDate: new Date().toISOString().split('T')[0],
    returnDate: "",
    actualReturnDate: "",
    daysRented: "1",
  });
  const [search, setSearch] = useState("");

  // Fetch rentals
  const fetchRentals = async () => {
    try {
      const res = await fetch("/api/rentals", {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched rentals:', data);
        setRentals(data);
      } else {
        const errorText = await res.text();
        console.error("Failed to fetch rentals:", res.status, res.statusText, errorText);
        // Only use mock data in development for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock data for development');
          setRentals([
            {
              id: 1,
              customerEmail: "john@example.com",
              games: [{ gameId: 1, title: "The Witcher 3", quantity: 1, dailyRate: 5.99 }],
              totalCost: 29.95,
              status: "Active",
              rentalDate: "2025-06-25",
              returnDate: "2025-07-02",
              daysRented: 7,
            },
            {
              id: 2,
              customerEmail: "jane@example.com",
              games: [{ gameId: 2, title: "Cyberpunk 2077", quantity: 1, dailyRate: 6.99 }],
              totalCost: 20.97,
              status: "Returned",
              rentalDate: "2025-06-20",
              returnDate: "2025-06-23",
              actualReturnDate: "2025-06-23",
              daysRented: 3,
            },
          ]);
        } else {
          setRentals([]);
        }
      }
    } catch (error) {
      console.error("Error fetching rentals:", error);
      setRentals([]);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Auto-calculate return date and total cost when rental date or days change
    if (name === 'rentalDate' || name === 'daysRented') {
      const rentalDate = name === 'rentalDate' ? value : form.rentalDate;
      const days = name === 'daysRented' ? parseInt(value) || 1 : parseInt(form.daysRented) || 1;
      
      if (rentalDate) {
        const returnDate = new Date(rentalDate);
        returnDate.setDate(returnDate.getDate() + days);
        const totalCost = form.games.reduce((sum, g) => sum + (g.dailyRate * g.quantity * days), 0);
        
        setForm(prev => ({
          ...prev,
          returnDate: returnDate.toISOString().split('T')[0],
          totalCost: totalCost.toFixed(2),
        }));
      }
    }
  };

  // Handlers for games
  const handleAddGame = () => {
    setForm((prev) => ({
      ...prev,
      games: [
        ...prev.games,
        { gameId: 0, title: "", quantity: 1, dailyRate: 0 },
      ],
    }));
  };

  const handleGameChange = async <K extends keyof GameRental>(idx: number, field: K, value: GameRental[K]) => {
    setForm((prev) => {
      const games = [...prev.games];
      games[idx] = { ...games[idx], [field]: value };
      
      // Recalculate total cost
      const days = parseInt(prev.daysRented) || 1;
      const totalCost = games.reduce((sum, g) => sum + (Number(g.dailyRate) * Number(g.quantity) * days), 0);
      
      return { ...prev, games, totalCost: totalCost.toFixed(2) };
    });

    // If gameId is changed, fetch game info and update title/dailyRate
    if (field === "gameId" && value) {
      try {
        const res = await fetch(`/api/games`);
        if (res.ok) {
          const gamesList = await res.json();
          const found = gamesList.find((g: any) => g.id === Number(value));
          if (found) {
            setForm((prev) => {
              const games = [...prev.games];
              games[idx] = { 
                ...games[idx], 
                title: found.title, 
                dailyRate: found.price * 0.25 // 25% (quarter) of purchase price as daily rate
              };
              
              // Recalculate total cost
              const days = parseInt(prev.daysRented) || 1;
              const totalCost = games.reduce((sum, g) => sum + (Number(g.dailyRate) * Number(g.quantity) * days), 0);
              
              return { ...prev, games, totalCost: totalCost.toFixed(2) };
            });
          }
        }
      } catch (e) {
        console.error("Error fetching game info:", e);
      }
    }
  };

  const handleRemoveGame = (idx: number) => {
    setForm((prev) => {
      const games = prev.games.filter((_, i) => i !== idx);
      const days = parseInt(prev.daysRented) || 1;
      const totalCost = games.reduce((sum, g) => sum + (Number(g.dailyRate) * Number(g.quantity) * days), 0);
      
      return { ...prev, games, totalCost: totalCost.toFixed(2) };
    });
  };

  // Add or update rental
  const handleSubmit = async () => {
    try {
      const rentalData = {
        ...form,
        totalCost: parseFloat(form.totalCost),
        daysRented: parseInt(form.daysRented),
      };

      console.log('Submitting rental data:', rentalData);

      if (editRental) {
        console.log('Updating rental with ID:', editRental.id);
        const response = await fetch("/api/rentals", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...rentalData, id: editRental.id }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Update failed:', errorData);
          throw new Error(`Update failed: ${errorData.error}`);
        }
        
        const result = await response.json();
        console.log('Update successful:', result);
      } else {
        console.log('Creating new rental');
        const response = await fetch("/api/rentals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rentalData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Creation failed:', errorData);
          throw new Error(`Creation failed: ${errorData.error}`);
        }
        
        const result = await response.json();
        console.log('Creation successful:', result);
      }
      
      setOpen(false);
      setEditRental(null);
      resetForm();
      fetchRentals();
    } catch (error) {
      console.error("Error submitting rental:", error);
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const resetForm = () => {
    setForm({
      customerEmail: "",
      games: [],
      totalCost: "",
      status: "Active",
      rentalDate: new Date().toISOString().split('T')[0],
      returnDate: "",
      actualReturnDate: "",
      daysRented: "1",
    });
  };

  // Delete rental
  const handleDelete = async (id: number) => {
    try {
      await fetch("/api/rentals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchRentals();
    } catch (error) {
      console.error("Error deleting rental:", error);
    }
  };

  // Edit rental
  const handleEdit = (rental: Rental) => {
    setEditRental(rental);
    setForm({
      customerEmail: rental.customerEmail,
      games: rental.games,
      totalCost: rental.totalCost.toString(),
      status: rental.status,
      rentalDate: rental.rentalDate,
      returnDate: rental.returnDate,
      actualReturnDate: rental.actualReturnDate || "",
      daysRented: rental.daysRented.toString(),
    });
    setOpen(true);
  };

  // Filter rentals
  const filteredRentals = rentals.filter((rental) =>
    rental.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
    rental.games.some(game => game.title.toLowerCase().includes(search.toLowerCase())) ||
    rental.status.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'primary';
      case 'Returned': return 'success';
      case 'Overdue': return 'error';
      case 'Cancelled': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Rental Management
      </Typography>
      
      {/* Controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          label="Search rentals..."
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
        >
          Add New Rental
        </Button>
      </Box>

      {/* Rentals Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Customer Email</TableCell>
              <TableCell>Games</TableCell>
              <TableCell>Rental Date</TableCell>
              <TableCell>Return Date</TableCell>
              <TableCell>Days Rented</TableCell>
              <TableCell>Total Cost</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRentals.map((rental) => (
              <TableRow key={rental.id}>
                <TableCell>{rental.id}</TableCell>
                <TableCell>{rental.customerEmail}</TableCell>
                <TableCell>
                  <Box>
                    {rental.games.map((game, idx) => (
                      <Typography key={idx} variant="body2">
                        {game.title} (x{game.quantity})
                      </Typography>
                    ))}
                  </Box>
                </TableCell>
                <TableCell>{format(new Date(rental.rentalDate), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{format(new Date(rental.returnDate), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{rental.daysRented} days</TableCell>
                <TableCell>${rental.totalCost.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip 
                    label={rental.status} 
                    color={getStatusColor(rental.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(rental)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(rental.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editRental ? "Edit Rental" : "Add New Rental"}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            {/* Customer Email */}
            <TextField
              label="Customer Email"
              name="customerEmail"
              value={form.customerEmail}
              onChange={handleChange}
              fullWidth
              required
            />

            {/* Rental Details */}
            <Box display="flex" gap={2}>
              <TextField
                label="Rental Date"
                name="rentalDate"
                type="date"
                value={form.rentalDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Days to Rent"
                name="daysRented"
                type="number"
                value={form.daysRented}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Return Date"
                name="returnDate"
                type="date"
                value={form.returnDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{ readOnly: true }}
              />
            </Box>

            {/* Status and Actual Return Date */}
            <Box display="flex" gap={2}>
              <TextField
                label="Status"
                name="status"
                select
                value={form.status}
                onChange={handleChange}
                fullWidth
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Actual Return Date"
                name="actualReturnDate"
                type="date"
                value={form.actualReturnDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={form.status === 'Active'}
              />
            </Box>

            {/* Games Section */}
            <Typography variant="h6">Games</Typography>
            {form.games.map((game, idx) => (
              <Box key={idx} display="flex" gap={2} alignItems="center">
                <TextField
                  label="Game ID"
                  type="number"
                  value={game.gameId || ""}
                  onChange={(e) => handleGameChange(idx, "gameId", parseInt(e.target.value) || 0)}
                  sx={{ width: 100 }}
                />
                <TextField
                  label="Game Title"
                  value={game.title}
                  onChange={(e) => handleGameChange(idx, "title", e.target.value)}
                  fullWidth
                />
                <TextField
                  label="Quantity"
                  type="number"
                  value={game.quantity}
                  onChange={(e) => handleGameChange(idx, "quantity", parseInt(e.target.value) || 1)}
                  sx={{ width: 100 }}
                  inputProps={{ min: 1 }}
                />
                <TextField
                  label="Daily Rate"
                  type="number"
                  value={game.dailyRate}
                  onChange={(e) => handleGameChange(idx, "dailyRate", parseFloat(e.target.value) || 0)}
                  sx={{ width: 120 }}
                  inputProps={{ min: 0, step: 0.01 }}
                />
                <IconButton onClick={() => handleRemoveGame(idx)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button onClick={handleAddGame} startIcon={<AddIcon />} variant="outlined">
              Add Game
            </Button>

            {/* Total Cost */}
            <TextField
              label="Total Cost"
              name="totalCost"
              value={form.totalCost}
              fullWidth
              InputProps={{ readOnly: true, startAdornment: '$' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editRental ? "Update" : "Create"} Rental
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RentalManagementPage;

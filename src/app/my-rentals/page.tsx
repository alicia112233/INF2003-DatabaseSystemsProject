'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Layout from '@/components/layout';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

type UserRental = {
  id: number;
  gameTitle: string;
  gameImage: string;
  rentalDate: string;
  returnDate: string;
  daysRented: number;
  dailyRate: number;
  totalCost: number;
  status: string;
  gameId: number;
};

const MyRentalsPage = () => {
  const [rentals, setRentals] = useState<UserRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returnDialog, setReturnDialog] = useState<{ open: boolean; rental: UserRental | null }>({
    open: false,
    rental: null,
  });

  const fetchUserRentals = async () => {
    try {
      const response = await fetch('/api/rentals/user');
      if (response.ok) {
        const data = await response.json();
        setRentals(data);
      } else {
        throw new Error('Failed to fetch rentals');
      }
    } catch (err) {
      console.error('Error fetching user rentals:', err);
      setError('Failed to load your rentals');
      // Mock data for demonstration
      setRentals([
        {
          id: 1,
          gameTitle: 'The Witcher 3: Wild Hunt',
          gameImage: '/images/products/WW.jpg',
          rentalDate: '2025-06-25',
          returnDate: '2025-07-02',
          daysRented: 7,
          dailyRate: 14.99,
          totalCost: 104.93,
          status: 'Active',
          gameId: 1,
        },
        {
          id: 2,
          gameTitle: 'Cyberpunk 2077',
          gameImage: '/images/products/CHI.jpg',
          rentalDate: '2025-06-20',
          returnDate: '2025-06-27',
          daysRented: 7,
          dailyRate: 12.49,
          totalCost: 87.43,
          status: 'Returned',
          gameId: 2,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRentals();
  }, []);

  const handleReturnGame = async (rental: UserRental) => {
    try {
      const response = await fetch('/api/rentals/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rentalId: rental.id }),
      });

      if (response.ok) {
        toast.success('Game returned successfully!');
        fetchUserRentals(); // Refresh the list
        setReturnDialog({ open: false, rental: null });
      } else {
        throw new Error('Failed to return game');
      }
    } catch (err) {
      console.error('Error returning game:', err);
      toast.error('Failed to return game');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'primary';
      case 'Returned':
        return 'success';
      case 'Overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const isOverdue = (returnDate: string, status: string) => {
    return status === 'Active' && new Date(returnDate) < new Date();
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
          My Rentals
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {rentals.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              You haven't rented any games yet.
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
                  <TableCell>Game</TableCell>
                  <TableCell>Rental Period</TableCell>
                  <TableCell>Daily Rate</TableCell>
                  <TableCell>Total Cost</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rentals.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <img
                          src={rental.gameImage}
                          alt={rental.gameTitle}
                          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <Typography variant="body1">{rental.gameTitle}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {format(new Date(rental.rentalDate), 'MMM dd, yyyy')} - 
                          {format(new Date(rental.returnDate), 'MMM dd, yyyy')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {rental.daysRented} days
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>${rental.dailyRate.toFixed(2)}/day</TableCell>
                    <TableCell>${rental.totalCost.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip
                        label={isOverdue(rental.returnDate, rental.status) ? 'Overdue' : rental.status}
                        color={isOverdue(rental.returnDate, rental.status) ? 'error' : getStatusColor(rental.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {rental.status === 'Active' && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setReturnDialog({ open: true, rental })}
                          color={isOverdue(rental.returnDate, rental.status) ? 'error' : 'primary'}
                        >
                          Return Game
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Return Confirmation Dialog */}
        <Dialog
          open={returnDialog.open}
          onClose={() => setReturnDialog({ open: false, rental: null })}
        >
          <DialogTitle>Return Game</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to return "{returnDialog.rental?.gameTitle}"?
            </Typography>
            {returnDialog.rental && isOverdue(returnDialog.rental.returnDate, returnDialog.rental.status) && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This game is overdue. Additional fees may apply.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReturnDialog({ open: false, rental: null })}>
              Cancel
            </Button>
            <Button
              onClick={() => returnDialog.rental && handleReturnGame(returnDialog.rental)}
              variant="contained"
            >
              Confirm Return
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default MyRentalsPage;

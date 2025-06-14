/* eslint-disable react/no-unescaped-entities */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Avatar,
  Tooltip,
  Grid,
  Card,
  CardContent,
  TablePagination,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import UserFilters from './components/UserFilters';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  contactNo: string;
  gender: 'M' | 'F';
  is_admin: 'T' | 'F';
  avatarUrl: string;
  createdAt: string;
  loyaltyPoints: number;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  contactNo: string;
  gender: 'M' | 'F' | '';
  is_admin: 'T' | 'F';
  password: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Form data
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    contactNo: '',
    gender: '',
    is_admin: 'F',
    password: '',
  });

  // Statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    customerUsers: 0,
  });

  // Filtered users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === '' || user.is_admin === roleFilter;
      const matchesGender = genderFilter === '' || user.gender === genderFilter;
      
      return matchesSearch && matchesRole && matchesGender;
    });
  }, [users, searchTerm, roleFilter, genderFilter]);

  // Paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  const calculateStats = (userList: User[]) => {
    const totalUsers = userList.length;
    const adminUsers = userList.filter(user => user.is_admin === 'T').length;
    const customerUsers = totalUsers - adminUsers;

    setStats({ totalUsers, adminUsers, customerUsers });
  };

  const handleOpenDialog = (mode: 'create' | 'edit', user?: User) => {
    setDialogMode(mode);
    setSelectedUser(user || null);
    
    if (mode === 'edit' && user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contactNo: user.contactNo,
        gender: user.gender,
        is_admin: user.is_admin,
        password: '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        contactNo: '',
        gender: '',
        is_admin: 'F',
        password: '',
      });
    }
    
    setOpenDialog(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    try {
      const url = dialogMode === 'create' ? '/api/users' : `/api/users/${selectedUser?.id}`;
      const method = dialogMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        handleCloseDialog();
      } else {
        setError(data.error || 'Operation failed');
      }
    } catch (error) {
      setError('Operation failed');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setDeleteDialog(false);
        setUserToDelete(null);
      } else {
        setError(data.error || 'Failed to delete user');
      }
    } catch (error) {
      setError('Failed to delete user');
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/users');
        const data = await response.json();

        if (response.ok) {
          setUsers(data.users);
          calculateStats(data.users);
        } else {
          setError(data.error || 'Failed to fetch users');
        }
      } catch (error) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <PageContainer title="User Management" description="Manage system users">
        <Typography>Loading...</Typography>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="User Management" description="Manage system users">
      <Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid 
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <PersonIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{stats.totalUsers}</Typography>
                    <Typography color="textSecondary">Total Users</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid 
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <AdminIcon color="secondary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{stats.adminUsers}</Typography>
                    <Typography color="textSecondary">Admin Users</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid 
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <PeopleIcon color="info" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{stats.customerUsers}</Typography>
                    <Typography color="textSecondary">Customers</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Users Table */}
        <DashboardCard title="Users">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              All Users ({filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('create')}
            >
              Add New User
            </Button>
          </Box>

          {/* Filters */}
          <UserFilters
            searchTerm={searchTerm}
            roleFilter={roleFilter}
            genderFilter={genderFilter}
            onSearchChange={setSearchTerm}
            onRoleFilterChange={setRoleFilter}
            onGenderFilterChange={setGenderFilter}
          />

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Avatar</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Loyalty Points</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`}>
                        {user.firstName.charAt(0)}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {user.firstName} {user.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.contactNo}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.gender === 'M' ? 'Male' : 'Female'} 
                        size="small"
                        color={user.gender === 'M' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.is_admin === 'T' ? 'Admin' : 'Customer'} 
                        size="small"
                        color={user.is_admin === 'T' ? 'error' : 'default'}
                        icon={user.is_admin === 'T' ? <AdminIcon /> : <PersonIcon />}
                      />
                    </TableCell>
                    <TableCell>{user.loyaltyPoints || 0}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit User">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog('edit', user)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton
                          color="error"
                          onClick={() => {
                            setUserToDelete(user);
                            setDeleteDialog(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No users found matching your criteria
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </DashboardCard>

        {/* Create/Edit User Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {dialogMode === 'create' ? 'Create New User' : 'Edit User'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid 
                size={{
                  xs: 12,
                  md: 6,
                  lg: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </Grid>
              <Grid 
                size={{
                  xs: 12,
                  md: 6,
                  lg: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </Grid>
              <Grid 
                size={{
                  xs: 12,
                  md: 6,
                  lg: 8,
                }}
              >
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid 
                size={{
                  xs: 12,
                  md: 6,
                  lg: 4,
                }}
              >
                <TextField
                  fullWidth
                  label="Contact Number"
                  value={formData.contactNo}
                  onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                  required
                />
              </Grid>
              <Grid 
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 6,
                }}
              >
                <FormControl fullWidth required>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={formData.gender}
                    label="Gender"
                    displayEmpty
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' })}
                  >
                    <MenuItem value="M">Male</MenuItem>
                    <MenuItem value="F">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid 
                size={{
                  xs: 12,
                  md: 6,
                  lg: 6,
                }}
              >
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.is_admin}
                    label="Role"
                    onChange={(e) => setFormData({ ...formData, is_admin: e.target.value as 'T' | 'F' })}
                  >
                    <MenuItem value="F">Customer</MenuItem>
                    <MenuItem value="T">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid 
                size={{
                  xs: 12,
                  md: 6,
                  lg: 12,
                }}
              >
                <TextField
                  fullWidth
                  label={dialogMode === 'create' ? 'Password' : 'New Password (leave blank to keep current)'}
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={dialogMode === 'create'}
                  helperText={dialogMode === 'edit' ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {dialogMode === 'create' ? 'Create' : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
                Are you sure you want to delete user &quot;{userToDelete?.firstName} {userToDelete?.lastName}&quot;?
                This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDeleteUser} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default UserManagement;
'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Grid,
} from '@mui/material';

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

interface UserFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: UserFormData) => void;
    user?: User | null;
    loading?: boolean;
    mode: 'create' | 'edit';
}

const UserFormDialog: React.FC<UserFormDialogProps> = ({
    open,
    onClose,
    onSubmit,
    user,
    loading = false,
    mode,
}) => {
    const [formData, setFormData] = useState<UserFormData>({
        firstName: '',
        lastName: '',
        email: '',
        contactNo: '',
        gender: '',
        is_admin: 'F',
        password: '',
    });

    useEffect(() => {
        if (user && mode === 'edit') {
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
    }, [user, mode, open]);

    const handleSubmit = () => {
        onSubmit(formData);
    };

    const handleInputChange = (field: keyof UserFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {mode === 'create' ? 'Create New User' : 'Edit User'}
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
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
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
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
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
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
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
                            label="Contact Number"
                            value={formData.contactNo}
                            onChange={(e) => handleInputChange('contactNo', e.target.value)}
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
                                onChange={(e) => handleInputChange('gender', e.target.value)}
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
                                onChange={(e) => handleInputChange('is_admin', e.target.value)}
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
                            label={mode === 'create' ? 'Password' : 'New Password (leave blank to keep current)'}
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required={mode === 'create'}
                            helperText={mode === 'edit' ? 'Leave blank to keep current password' : 'Minimum 6 characters'}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    disabled={loading}
                >
                    {loading ? 'Processing...' : (mode === 'create' ? 'Create' : 'Update')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserFormDialog;
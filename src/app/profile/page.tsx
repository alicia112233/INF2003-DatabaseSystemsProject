'use client';
import { Box, Typography, Card, CardContent, Avatar, Divider, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, InputAdornment, Snackbar, Alert } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import Layout from '@/components/layout';
import { useState, useEffect } from 'react';
import { IconMail, IconPhone, IconLock } from '@tabler/icons-react';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  contactNo: string;
  gender: string;
  avatarUrl: string;
}

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChange = async () => {
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long!');
      return;
    }

    try {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setShowPasswordDialog(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setToastSeverity("success");
        setToastMessage("Password changed successfully!");
        setOpenToast(true);
      } else {
        const error = await response.json();
        setPasswordError(error.message || 'Failed to change password');
        console.error('Error changing password:', error);
        setToastSeverity("error");
        setToastMessage("Error changing password!");
        setOpenToast(true);
      }
    } catch (err) {
      setPasswordError('Error changing password');
      console.error('Error changing password:', err);
      setToastSeverity("error");
      setToastMessage("Error changing password!");
      setOpenToast(true);
    }
  };

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleCloseToast = () => {
    setOpenToast(false);
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Client-side validation before upload
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png'];

    // Get file extension
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    // Check both MIME type and file extension
    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);

    if (!isValidType) {
      setToastSeverity("error");
      setToastMessage("Invalid file type. Only JPG, JPEG, and PNG are allowed.");
      setOpenToast(true);
      // Reset the input
      event.target.value = '';
      return;
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setToastSeverity("error");
      setToastMessage("File too large. Maximum size is 5MB.");
      setOpenToast(true);
      // Reset the input
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      // Upload the file
      const uploadRes = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      if (uploadRes.ok) {
        const { avatarUrl } = await uploadRes.json();

        // Update the avatar URL in the database
        const updateRes = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ avatarUrl }),
        });

        if (updateRes.ok) {
          // Update the local state
          setUserProfile((prev) => prev ? { ...prev, avatarUrl } : prev);
          setToastSeverity("success");
          setToastMessage("Avatar uploaded successfully!");
          setOpenToast(true);
        } else {
          const error = await updateRes.json();
          setToastSeverity("error");
          setToastMessage("Failed to update avatar.");
          setOpenToast(true);
          console.error('Failed to update avatar URL in database ', error.message);
        }
      } else {
        const error = await uploadRes.json();
        setToastSeverity("error");
        setToastMessage("Upload failed! Check your network.");
        setOpenToast(true);
        console.error('Upload failed:', error.message);
      }
    } catch (err) {
      setToastSeverity("error");
      setToastMessage("Error uploading file!");
      setOpenToast(true);
      console.error('Error uploading file:', err);
    } finally {
      // Reset the input so the same file can be selected again if needed
      event.target.value = '';
    }
  };

  useEffect(() => {
    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
        } else {
          console.error('Failed to fetch profile');
          setToastSeverity("error");
          setToastMessage("Failed to fetch profile!");
          setOpenToast(true);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setToastSeverity("error");
        setToastMessage("Failed to fetch profile!");
        setOpenToast(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Layout>
        <PageContainer title="Profile" description="User Profile">
          <Typography>Loading...</Typography>
        </PageContainer>
      </Layout>
    );
  }

  if (!userProfile) {
    return (
      <Layout>
        <PageContainer title="Profile" description="User Profile">
          <Typography>Unable to load profile information.</Typography>
        </PageContainer>
      </Layout>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Layout>
      <PageContainer title="Profile" description="User Profile">
        <DashboardCard title="My Profile">
          <Card sx={{ maxWidth: 600, mx: 'auto' }}>
            <CardContent sx={{ p: 4 }}>
              {/* Avatar and Name Section */}
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4
              }}>
                <Box sx={{
                  position: 'relative',
                  display: 'inline-block',
                  mb: 2
                }}>
                  {/* Avatar Image */}
                  <Avatar
                    src={userProfile.avatarUrl}
                    sx={{
                      width: 100,
                      height: 100,
                      fontSize: '2rem',
                      bgcolor: 'primary.main',
                    }}
                  >
                    {!userProfile.avatarUrl && getInitials(userProfile.firstName, userProfile.lastName)}
                  </Avatar>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    id="upload-avatar"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />

                  {/* Hover Overlay with Button */}
                  <label htmlFor="upload-avatar">
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: 100,
                        height: 100,
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.3s',
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 1,
                        },
                      }}
                    >
                      Edit Avatar
                    </Box>
                  </label>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h4">
                    {userProfile.firstName} {userProfile.lastName}
                  </Typography>
                  {userProfile.gender === 'F' && (
                    <Typography variant="h5" sx={{ color: '#ff69b4' }}>
                      ♀
                    </Typography>
                  )}
                  {userProfile.gender === 'M' && (
                    <Typography variant="h5" sx={{ color: '#4169e1' }}>
                      ♂
                    </Typography>
                  )}
                  {userProfile.gender === 'O' && (
                    <Typography variant="h5" sx={{ color: '#9c27b0' }}>
                      ⚧
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Profile Information */}
              <Box sx={{ space: 2 }}>
                {/* Email */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 1
                }}>
                  <IconMail size={24} style={{ marginRight: 16, color: '#556cd6' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email Address
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {userProfile.email}
                    </Typography>
                  </Box>
                </Box>

                {/* Contact Number */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 1
                }}>
                  <IconPhone size={24} style={{ marginRight: 16, color: '#556cd6' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Contact Number
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {userProfile.contactNo}
                    </Typography>
                  </Box>
                </Box>

                {/* Change Password */}
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 1
                }}>
                  <IconLock size={24} style={{ marginRight: 16, color: '#556cd6' }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Password
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                      ••••••••
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowPasswordDialog(true)}
                      sx={{ mt: 1 }}
                    >
                      Change Password
                    </Button>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </DashboardCard>
      </PageContainer>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type={showPasswords.current ? 'text' : 'password'}
            label="Current Password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => togglePasswordVisibility('current')} edge="end">
                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <TextField
            fullWidth
            type={showPasswords.new ? 'text' : 'password'}
            label="New Password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => togglePasswordVisibility('new')} edge="end">
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <TextField
            fullWidth
            type={showPasswords.confirm ? 'text' : 'password'}
            label="Confirm New Password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => togglePasswordVisibility('confirm')} edge="end">
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {passwordError && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {passwordError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} variant="contained">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={openToast} 
        autoHideDuration={6000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toastSeverity} 
          sx={{ width: '100%' }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default ProfilePage;
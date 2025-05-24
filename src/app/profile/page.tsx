'use client';
import { Box, Typography, Card, CardContent, Avatar, Divider } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import Layout from '@/components/layout';
import { useState, useEffect } from 'react';
import { IconUser, IconMail, IconPhone } from '@tabler/icons-react';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  contactNo: string;
  gender: string;
}

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
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
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    fontSize: '2rem',
                    bgcolor: 'primary.main',
                    mb: 2
                  }}
                >
                  {getInitials(userProfile.firstName, userProfile.lastName)}
                </Avatar>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {userProfile.firstName} {userProfile.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {userProfile.gender}
                </Typography>
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

                {/* Full Name */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3,
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 1
                }}>
                  <IconUser size={24} style={{ marginRight: 16, color: '#556cd6' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {userProfile.firstName} {userProfile.lastName}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </DashboardCard>
      </PageContainer>
    </Layout>
  );
};

export default ProfilePage;
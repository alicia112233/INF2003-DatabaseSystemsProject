'use client'
import { Grid, Box, Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
// components
import SalesOverview from '@/app/(DashboardLayout)/components/dashboard/SalesOverview';
import YearlyBreakup from '@/app/(DashboardLayout)/components/dashboard/YearlyBreakup';
import RecentTransactions from '@/app/(DashboardLayout)/components/dashboard/RecentTransactions';
import ProductPerformance from '@/app/(DashboardLayout)/components/dashboard/ProductPerformance';
import MonthlyEarnings from '@/app/(DashboardLayout)/components/dashboard/MonthlyEarnings';
import ReviewManagement from '@/app/(DashboardLayout)/components/dashboard/ReviewManagement';
import ReviewStatisticsCard from '@/app/(DashboardLayout)/components/dashboard/ReviewStatisticsCard';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/layout';

const AdminDashboard = () => {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is admin
        const userRole = localStorage.getItem('userRole');
        const isLoggedIn = localStorage.getItem('isLoggedIn');

        if (!isLoggedIn || userRole !== 'admin') {
            router.push('/authentication/login');
        } else {
            setIsAdmin(true);
        }
        setLoading(false);
    }, [router]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAdmin) {
        return null; // Will redirect in useEffect
    }

    return (
        <Layout>
            <PageContainer title="Admin | Game Haven | Hybrid Game Collection Store" description="Admin Dashboard">
                <Typography variant="h3" mb={4}>Admin Dashboard</Typography>
                <Box>
                    <Grid container spacing={3}>
                        <Grid
                            size={{
                                xs: 12,
                                lg: 8
                            }}>
                            <SalesOverview />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                lg: 4
                            }}>
                            <Grid container spacing={3}>
                                <Grid size={12}>
                                    <YearlyBreakup />
                                </Grid>
                                <Grid size={12}>
                                    <MonthlyEarnings />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                lg: 4
                            }}>
                            <RecentTransactions />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                lg: 4
                            }}>
                            <ReviewManagement />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                lg: 4
                            }}>
                            <ReviewStatisticsCard />
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                lg: 8
                            }}>
                            <ProductPerformance />
                        </Grid>
                    </Grid>
                </Box>
            </PageContainer>
        </Layout>
    );
}

export default AdminDashboard;
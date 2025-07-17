'use client';

import React from 'react';
import { Box } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import PerformanceDashboard from '@/components/performance/Dashboard';

const PerformancePage = () => {
    return (
        <PageContainer title="Performance Dashboard" description="Monitor API performance and system metrics">
            <DashboardCard>
                <Box>
                    <PerformanceDashboard />
                </Box>
            </DashboardCard>
        </PageContainer>
    );
};

export default PerformancePage;
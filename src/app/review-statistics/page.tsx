'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/layout';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import ReviewStatistics from '@/app/(DashboardLayout)/components/dashboard/ReviewStatistics';

const ReviewStatisticsPage = () => {
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
            <PageContainer 
                title="Review Statistics | Game Haven Admin" 
                description="Comprehensive review statistics and analytics for all games"
            >
                <ReviewStatistics />
            </PageContainer>
        </Layout>
    );
};

export default ReviewStatisticsPage;

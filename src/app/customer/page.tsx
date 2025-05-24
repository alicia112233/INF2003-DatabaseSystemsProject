'use client';
import { Box, Typography, Button } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import Blog from '@/app/(DashboardLayout)/components/dashboard/Blog';
import Image from 'next/image';
import BlankCard from '@/app/(DashboardLayout)/components/shared/BlankCard';
import { IconChevronLeft, IconChevronRight, IconShoppingCart, IconStar } from '@tabler/icons-react';

// Sample customer home product data page
const products = [
  {
    id: 1,
    title: "PlayStation 5",
    description: "Next-gen gaming console with stunning graphics",
    photo: '/images/products/s4.jpg',
    price: 499,
    rating: 5,
  },
  {
    id: 2,
    title: "Xbox Series X",
    description: "Microsoft's flagship gaming console",
    photo: '/images/products/s5.jpg',
    price: 499,
    rating: 4,
  },
  {
    id: 3,
    title: "Nintendo Switch OLED",
    description: "Portable gaming with enhanced display",
    photo: '/images/products/s7.jpg',
    price: 349,
    rating: 5,
  },
  {
    id: 4,
    title: "Gaming Headset Pro",
    description: "Immersive audio experience for gamers",
    photo: '/images/products/s11.jpg',
    price: 129,
    rating: 4,
  },
];

const custHomePage = () => {
  return (
    <PageContainer title="Game Haven" description="Your ultimate gaming destination">
      <DashboardCard title="Featured Product">
        test test
      </DashboardCard>
      
      <Box sx={{ mt: 4 }}>
        <DashboardCard title="More Products">
          <Blog />
        </DashboardCard>
      </Box>
    </PageContainer>
  );
};

export default custHomePage;
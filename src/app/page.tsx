'use client';
import { Box, Typography, Button } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import Blog from '@/app/(DashboardLayout)/components/dashboard/Blog';
import { useState } from 'react';
import Image from 'next/image';
import BlankCard from '@/app/(DashboardLayout)/components/shared/BlankCard';
import { IconChevronLeft, IconChevronRight, IconShoppingCart, IconStar } from '@tabler/icons-react';
import Layout from '@/components/layout';

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

const HomePage = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === products.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? products.length - 1 : prevIndex - 1
        );
    };

    const currentProduct = products[currentIndex];

    return (
        <Layout>
            <PageContainer title="Game Haven" description="Your ultimate gaming destination">
                <DashboardCard title="Featured Product">
                    <Box sx={{ position: 'relative', width: '100%', height: '400px' }}>
                        {/* Left navigation button */}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={prevSlide}
                            sx={{
                                minWidth: '40px',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                position: 'absolute',
                                left: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 10
                            }}
                        >
                            <IconChevronLeft size={20} />
                        </Button>

                        <BlankCard>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                alignItems: 'center',
                                p: 3
                            }}>
                                <Box sx={{
                                    position: 'relative',
                                    width: { xs: '100%', md: '50%' },
                                    height: '300px'
                                }}>
                                    <Image
                                        src={currentProduct.photo}
                                        alt={currentProduct.title}
                                        layout="fill"
                                        objectFit="contain"
                                    />
                                </Box>
                                <Box sx={{
                                    width: { xs: '100%', md: '50%' },
                                    p: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}>
                                    <Typography variant="h3" sx={{ mb: 2 }}>
                                        {currentProduct.title}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 3 }}>
                                        {currentProduct.description}
                                    </Typography>
                                    <Typography variant="h4" color="primary" sx={{ mb: 3 }}>
                                        ${currentProduct.price}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<IconShoppingCart size={20} />}
                                            sx={{ maxWidth: '200px' }}
                                        >
                                            Add to Cart
                                        </Button>
                                        <Button
                                            variant="contained"
                                            startIcon={<IconStar size={20} />}
                                            sx={{
                                                maxWidth: '200px',
                                                bgcolor: '#B8860B', // Dark yellow/goldenrod color
                                                '&:hover': {
                                                    bgcolor: '#9A7209', // Slightly darker on hover
                                                }
                                            }}
                                        >
                                            Add to WishList
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </BlankCard>

                        {/* Right navigation button */}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={nextSlide}
                            sx={{
                                minWidth: '40px',
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 10
                            }}
                        >
                            <IconChevronRight size={20} />
                        </Button>
                    </Box>
                </DashboardCard>

                <Box sx={{ mt: 4 }}>
                    <DashboardCard title="More Products">
                        <Blog />
                    </DashboardCard>
                </Box>
            </PageContainer>
        </Layout>
    );
};

export default HomePage;
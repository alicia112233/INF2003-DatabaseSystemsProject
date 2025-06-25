'use client';
import { Box, Typography, Button, Grid } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import Blog from '@/app/(DashboardLayout)/components/dashboard/Blog';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import BlankCard from '@/app/(DashboardLayout)/components/shared/BlankCard';
import { IconChevronLeft, IconChevronRight, IconShoppingCart, IconStar } from '@tabler/icons-react';
import Layout from '@/components/layout';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import AddToCartButton from '@/components/cart/AddToCartButton';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  category?: string;
  inStock?: boolean;
}

const HomePage = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');

    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) =>
            prevIndex === products.length - 1 ? 0 : prevIndex + 1
        );
    }, [products.length]);

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? products.length - 1 : prevIndex - 1
        );
    };

    const currentProduct = products[currentIndex];
    const isOutOfStock = currentProduct?.inStock === false;

    // auto slide every 3 seconds
    useEffect(() => {
        if (products.length === 0) return; // Don't start interval if no products
        
        const interval = setInterval(() => {
            nextSlide();
        }, 3000);

        return () => clearInterval(interval); // Cleanup on unmount
    }, [nextSlide, products.length]);

    useEffect(() => {
        // Replace this with your actual API call
        const fetchProducts = async () => {
          // Example products - replace with your API call
          const sampleProducts: Product[] = [
            {
              id: '1',
              name: 'Sample Product 1',
              price: 29.99,
              description: 'This is a sample product description',
              category: 'Electronics',
              inStock: true,
              image: '/images/products/OH.jpg'
            },
            {
              id: '2',
              name: 'Sample Product 2',
              price: 49.99,
              description: 'Another sample product',
              category: 'Clothing',
              inStock: false,
              image: '/images/products/WW.jpg'
            },
            {
              id: '3',
              name: 'Gaming Guide Book',
              price: 24.99,
              description: 'Complete gaming strategy guide',
              category: 'Books',
              inStock: true,
              image: '/images/products/SMB.jpg'
            }
          ];
          setProducts(sampleProducts);
          setFilteredProducts(sampleProducts);
        };
    
        fetchProducts();
      }, []);

    // Filter products based on search term, category, and stock status
    useEffect(() => {
        let filtered = products;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Category filter
        if (categoryFilter) {
            filtered = filtered.filter(product => product.category === categoryFilter);
        }

        // Stock filter
        if (stockFilter) {
            if (stockFilter === 'inStock') {
                filtered = filtered.filter(product => product.inStock === true);
            } else if (stockFilter === 'outOfStock') {
                filtered = filtered.filter(product => product.inStock === false);
            }
        }

        setFilteredProducts(filtered);
    }, [products, searchTerm, categoryFilter, stockFilter]);

    return (
        <Layout>
            <PageContainer title="Game Haven" description="Your ultimate gaming destination">
                <DashboardCard title="Featured & Recommended 👍">
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
                                        src={currentProduct?.image || '/images/products/noprodimg.png'}
                                        alt={currentProduct?.name || 'Product'}
                                        fill
                                        style={{ objectFit: 'contain' }}
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
                                        {currentProduct?.name || 'Loading...'}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 3 }}>
                                        {currentProduct?.description || 'Loading description...'}
                                    </Typography>
                                    <Typography variant="h4" color="primary" sx={{ mb: 3 }}>
                                        ${currentProduct?.price || 0}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        {currentProduct && (
                                            <AddToCartButton
                                                product={currentProduct}
                                                fullWidth
                                                variant={!isOutOfStock ? 'contained' : 'outlined'}
                                                disabled={isOutOfStock}
                                                buttonText={isOutOfStock ? 'No Stock' : 'Add to Cart'}
                                                sx={{ 
                                                    maxWidth: '50%',
                                                    minWidth: '100px',
                                                    height: '48px',
                                                    fontSize: '0.875rem'
                                                }}
                                            />
                                        )}
                                        <Button
                                            variant="contained"
                                            startIcon={<IconStar size={20} />}
                                            sx={{
                                                maxWidth: '50%',
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
                    <DashboardCard title="More Games">
                        <ProductFilters
                            searchTerm={searchTerm}
                            categoryFilter={categoryFilter}
                            stockFilter={stockFilter}
                            onSearchChange={setSearchTerm}
                            onCategoryFilterChange={setCategoryFilter}
                            onStockFilterChange={setStockFilter}
                        />

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                Showing {filteredProducts.length} of {products.length} games
                            </Typography>
                        </Box>

                        <Grid container spacing={3}>
                            {filteredProducts.map((product) => (
                                <Grid 
                                    size = {{
                                        xs: 12,
                                        md: 6,
                                        lg: 4,
                                        xl: 3
                                    }}
                                    key={product.id}
                                >
                                    <ProductCard product={product} />
                                </Grid>
                            ))}
                        </Grid>

                        {filteredProducts.length === 0 && products.length > 0 && (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="h6" color="text.secondary">
                                    No games found matching your criteria
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Try adjusting your filters
                                </Typography>
                            </Box>
                        )}
                    </DashboardCard>
                </Box>
            </PageContainer>
        </Layout>
    );
};

export default HomePage;
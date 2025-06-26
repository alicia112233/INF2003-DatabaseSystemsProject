'use client';

import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import Layout from '@/components/layout';

interface Product {
    id: string;
    name: string;
    price: number;
    image?: string;
    description?: string;
    category?: string;
    inStock?: boolean;
}

const ProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');

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
                    image: '/images/products/WW.jpg'
                },
                {
                    id: '2',
                    name: 'Sample Product 2',
                    price: 49.99,
                    description: 'Another sample product',
                    category: 'Clothing',
                    inStock: false,
                    image: '/images/products/OH.jpg'
                },
                {
                    id: '3',
                    name: 'Gaming Book',
                    price: 19.99,
                    description: 'A comprehensive gaming guide',
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
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Our Products
                </Typography>

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
                        Showing {filteredProducts.length} of {products.length} products
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {filteredProducts.map((product) => (
                        <Grid size={{
                            xs: 12,
                            md: 6,
                            lg: 4,
                            xl: 3,
                        }}
                            key={product.id}>
                            <ProductCard product={product} />
                        </Grid>
                    ))}
                </Grid>

                {filteredProducts.length === 0 && products.length > 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary">
                            No products found matching your criteria
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Try adjusting your filters
                        </Typography>
                    </Box>
                )}
            </Container>
        </Layout>
    );
};

export default ProductsPage;
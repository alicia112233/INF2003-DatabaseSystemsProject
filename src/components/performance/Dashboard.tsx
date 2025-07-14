'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
} from '@mui/material';

interface PerformanceData {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    memoryStats: {
        used: number;
        total: number;
        percentage: number;
    };
    slowestRequests: Array<{
        endpoint: string;
        method: string;
        duration: number;
        statusCode: number;
        timestamp: string;
        userEmail?: string;
        userRole?: string;
        ip?: string;
    }>;
    endpointStats: Array<{
        endpoint: string;
        method: string;
        count: number;
        averageTime: number;
        errorRate: number;
        userEmail?: string;
        userRole?: string;
        ip?: string;
    }>;
    lastUpdated: string;
}

const PerformanceDashboard: React.FC = () => {
    const [data, setData] = useState<PerformanceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState('15m');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const [methodFilter, setMethodFilter] = useState<string>('All');
    const [roleFilter, setRoleFilter] = useState<string>('All');
    const [statusFilter, setStatusFilter] = useState<string>('All');

    const fetchPerformanceData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/performance?timeframe=${timeframe}`);
            if (!response.ok) {
                throw new Error('Failed to fetch performance data');
            }
            const result = await response.json();
            setData(result);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, [timeframe]);

    useEffect(() => {
        fetchPerformanceData();
    }, [fetchPerformanceData, timeframe]);

    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(fetchPerformanceData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [autoRefresh, fetchPerformanceData, timeframe]);

    const formatBytes = (bytes: number) => {
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    };

    const formatDuration = (ms: number) => {
        return `${ms.toFixed(2)}ms`;
    };

    const handleClearData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/performance/clear', {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw new Error('Failed to clear performance data');
            }
            
            // Refresh the data after clearing
            await fetchPerformanceData();
            setShowClearDialog(false);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to clear data');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime12Hour = (timestamp: string) => {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 => 12
        const hourStr = String(hours).padStart(2, '0');

        return `${day}/${month}/${year} ${hourStr}:${minutes}:${seconds} ${ampm}`;
    };

    if (loading && !data) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
                <Button onClick={fetchPerformanceData} sx={{ ml: 2 }}>
                    Retry
                </Button>
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Performance Monitoring Dashboard
            </Typography>

            {/* Top Controls */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
                <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={() => setShowClearDialog(true)}
                    disabled={loading}
                >
                    Clear Data
                </Button>

                <Box display="flex" gap={2} flexWrap="wrap">
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Timeframe</InputLabel>
                        <Select
                            value={timeframe}
                            label="Timeframe"
                            onChange={(e) => setTimeframe(e.target.value)}
                        >
                            <MenuItem value="5m">5 minutes</MenuItem>
                            <MenuItem value="15m">15 minutes</MenuItem>
                            <MenuItem value="1h">1 hour</MenuItem>
                            <MenuItem value="24h">24 hours</MenuItem>
                            <MenuItem value="7d">7 days</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        variant="outlined"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        color={autoRefresh ? 'primary' : 'secondary'}
                    >
                        Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
                    </Button>

                    <Button variant="contained" onClick={fetchPerformanceData}>
                        Refresh Now
                    </Button>
                </Box>
            </Box>

            {/* Filters Section */}
            <Box display="flex" gap={2} mb={3} mt={5} flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Method</InputLabel>
                    <Select
                        value={methodFilter}
                        label="Method"
                        onChange={(e) => setMethodFilter(e.target.value)}
                    >
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="GET">GET</MenuItem>
                        <MenuItem value="POST">POST</MenuItem>
                        <MenuItem value="PUT">PUT</MenuItem>
                        <MenuItem value="DELETE">DELETE</MenuItem>
                    </Select>
                </FormControl>

                {/* <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status Code</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Status Code"
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="200">200</MenuItem>
                        <MenuItem value="400">400</MenuItem>
                        <MenuItem value="401">401</MenuItem>
                        <MenuItem value="402">402</MenuItem>
                        <MenuItem value="403">403</MenuItem>
                        <MenuItem value="404">404</MenuItem>
                        <MenuItem value="Others">Others</MenuItem>
                    </Select>
                </FormControl> */}

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>User Role</InputLabel>
                    <Select
                        value={roleFilter}
                        label="User Role"
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <MenuItem value="All">All</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="user">User</MenuItem>
                        <MenuItem value="guest">Guest</MenuItem>
                    </Select>
                </FormControl>

                <Button
                    variant="text"
                    color="secondary"
                    onClick={() => {
                        setMethodFilter('All');
                        setStatusFilter('All');
                        setRoleFilter('All');
                    }}
                >
                    Clear Filters
                </Button>
            </Box>

            {data && (
                <>
                    {/* Key Metrics */}
                    <Grid container spacing={3} mb={3}>
                        <Grid 
                            size={{
                                xs: 12,
                                sm: 6,
                                md: 3,
                            }}
                        >
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Total Requests
                                    </Typography>
                                    <Typography variant="h4">
                                        {data.totalRequests}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 6,
                                md: 3,
                            }}
                        >
                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Avg Response Time
                                    </Typography>
                                    <Typography variant="h4">
                                        {formatDuration(data.averageResponseTime)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid 
                            size={{
                                xs: 12,
                                sm: 6,
                                md: 3,
                            }}
                        >

                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Error Rate
                                    </Typography>
                                    <Typography variant="h4" color={data.errorRate > 5 ? 'error' : 'success'}>
                                        {data.errorRate.toFixed(2)}%
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid 
                            size={{
                                xs: 12,
                                sm: 6,
                                md: 3,
                            }}
                        >

                            <Card>
                                <CardContent>
                                    <Typography color="textSecondary" gutterBottom>
                                        Memory Usage
                                    </Typography>
                                    <Typography variant="h4">
                                        {data.memoryStats.percentage.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {formatBytes(data.memoryStats.used)} / {formatBytes(data.memoryStats.total)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Slowest Requests */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
                                <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                                    Top 3 Slowest Requests
                                </Typography>
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel>Status Code</InputLabel>
                                    <Select
                                        value={statusFilter}
                                        label="Status Code"
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <MenuItem value="All">All</MenuItem>
                                        <MenuItem value="200">200</MenuItem>
                                        <MenuItem value="400">400</MenuItem>
                                        <MenuItem value="401">401</MenuItem>
                                        <MenuItem value="402">402</MenuItem>
                                        <MenuItem value="403">403</MenuItem>
                                        <MenuItem value="404">404</MenuItem>
                                        <MenuItem value="Others">Others</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Endpoint</TableCell>
                                            <TableCell>Method</TableCell>
                                            <TableCell>Duration</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Date & Time</TableCell>
                                            <TableCell>User</TableCell>
                                            <TableCell>Role</TableCell>
                                            <TableCell>IP</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.slowestRequests
                                            .filter(req =>
                                                (methodFilter === 'All' || req.method === methodFilter) &&
                                                (roleFilter === 'All' || req.userRole === roleFilter) &&
                                                (statusFilter === 'All' || (statusFilter === 'Others'
                                                        ? !['200', '400', '401', '402', '403', '404'].includes(req.statusCode.toString())
                                                        : req.statusCode.toString() === statusFilter)
                                                )
                                            )
                                            .reduce((unique: typeof data.slowestRequests, request) => {
                                                // Create a unique key based on endpoint and method
                                                const key = `${request.endpoint}-${request.method}`;
                                                const existing = unique.find(r => `${r.endpoint}-${r.method}` === key);
                                                
                                                // If this endpoint+method combo doesn't exist, or this request is slower, add/replace it
                                                if (!existing || request.duration > existing.duration) {
                                                    return unique.filter(r => `${r.endpoint}-${r.method}` !== key).concat(request);
                                                }
                                                
                                                return unique;
                                            }, [])
                                            .sort((a, b) => b.duration - a.duration) // Sort by duration descending
                                            .slice(0, 3) // Take only top 3
                                            .map((request, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{request.endpoint}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={request.method}
                                                            size="small"
                                                            color={
                                                                request.method === 'GET' ? 'primary' :
                                                                request.method === 'POST' ? 'success' :
                                                                request.method === 'PUT' ? 'warning' :
                                                                request.method === 'DELETE' ? 'error' : 'default'
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>{formatDuration(request.duration)}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={request.statusCode}
                                                            size="small"
                                                            color={request.statusCode >= 400 ? 'error' : 'success'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDateTime12Hour(request.timestamp)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {request.userRole === 'guest' || !request.userEmail ? 'Anonymous' : request.userEmail}
                                                    </TableCell>
                                                    <TableCell>
                                                        {request.userRole && request.userRole !== 'guest' ? (
                                                            <Chip 
                                                                label={request.userRole} 
                                                                size="small"
                                                                color={request.userRole === 'admin' ? 'warning' : 'default'}
                                                            />
                                                        ) : 'Guest'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {request.ip === "::1" ? "Localhost" : request.ip || 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {data.slowestRequests.length === 0 && (
                                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                                    No slow requests found
                                </Typography>
                            )}
                        </CardContent>
                    </Card>

                    {/* Endpoint Statistics */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Endpoint Statistics
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Endpoint</TableCell>
                                            <TableCell>Method</TableCell>
                                            <TableCell>Requests</TableCell>
                                            <TableCell>Avg Time</TableCell>
                                            <TableCell>Error Rate</TableCell>
                                            <TableCell>User Email</TableCell>
                                            <TableCell>User Role</TableCell>
                                            <TableCell>IP</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.endpointStats
                                            .filter(stat =>
                                                (methodFilter === 'All' || stat.method === methodFilter) &&
                                                (roleFilter === 'All' || stat.userRole === roleFilter)
                                            )
                                            .sort((a, b) => b.count - a.count)
                                            .map((stat, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{stat.endpoint}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={stat.method}
                                                            size="small"
                                                            color={
                                                                stat.method === 'GET' ? 'primary' :
                                                                stat.method === 'POST' ? 'success' :
                                                                stat.method === 'PUT' ? 'warning' :
                                                                stat.method === 'DELETE' ? 'error' : 'default'
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>{stat.count}</TableCell>
                                                    <TableCell>{formatDuration(stat.averageTime)}</TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            color={stat.errorRate > 5 ? 'error' : 'success'}
                                                        >
                                                            {stat.errorRate.toFixed(2)}%
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {stat.userEmail || 'Anonymous'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {stat.userRole && (
                                                            <Chip 
                                                                label={stat.userRole} 
                                                                size="small"
                                                                color={stat.userRole === 'admin' ? 'warning' : 'default'}
                                                            />
                                                        ) || 'Guest'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {stat.ip === "::1" ? "Localhost" : stat.ip || 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>

                    <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                        Last updated: {new Date(data.lastUpdated).toLocaleString()}
                    </Typography>
                </>
            )}

            {/* Clear Performance Data Confirmation Dialog */}
            <Dialog
                open={showClearDialog}
                onClose={() => setShowClearDialog(false)}
            >
                <DialogTitle>Clear Performance Data</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to clear all performance monitoring data? 
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowClearDialog(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleClearData} 
                        color="error" 
                        variant="contained"
                        disabled={loading}
                    >
                        Clear Data
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PerformanceDashboard;
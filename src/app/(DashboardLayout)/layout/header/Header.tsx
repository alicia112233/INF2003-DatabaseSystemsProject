import React, { useEffect, useState } from 'react';
import { Box, AppBar, Toolbar, styled, Stack, IconButton, Badge, Button } from '@mui/material';
import PropTypes from 'prop-types';
// components
import Profile from './Profile';
import { IconBellRinging, IconMenu } from '@tabler/icons-react';
import Link from 'next/link';
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import { setupInactivityTracker, clearInactivityTracker } from '@/utils/inactivityTracker';
import { Analytics } from "@vercel/analytics/next"

interface ItemType {
    toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

// LOGGED IN HEADER
const Header = ({ toggleMobileSidebar }: ItemType) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuthStatus = () => {
            try {
                // Check both localStorage and cookies for auth state
                const localStorageLogin = localStorage.getItem("isLoggedIn") === "true";
                const cookieLogin = document.cookie.includes('isLoggedIn=true');

                // If localStorage says logged in but cookies don't, clear localStorage
                if (localStorageLogin && !cookieLogin) {
                    console.log('Mismatch between localStorage and cookies - clearing localStorage');
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userRole');
                    setIsLoggedIn(false);

                    // Redirect to home if on protected route
                    if (window.location.pathname !== '/') {
                        window.location.replace('/');
                    }
                    return;
                }

                // If cookies say logged in but localStorage doesn't, sync localStorage
                if (!localStorageLogin && cookieLogin) {
                    console.log('Syncing localStorage with cookies');
                    localStorage.setItem('isLoggedIn', 'true');
                    // You might want to set other localStorage items here if needed
                }

                const finalLoginStatus = cookieLogin; // Use cookies as the source of truth
                setIsLoggedIn(finalLoginStatus);

                // Setup inactivity tracker if user is logged in
                if (finalLoginStatus) {
                    setupInactivityTracker();
                } else {
                    clearInactivityTracker();
                }

            } catch (error) {
                console.error('Error checking auth status:', error);

                // Fallback to checking cookies only
                const cookieLogin = document.cookie.includes('isLoggedIn=true');
                setIsLoggedIn(cookieLogin);

                if (!cookieLogin) {
                    // Clear localStorage if cookies indicate not logged in
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userRole');

                    // Redirect if on protected route
                    if (window.location.pathname !== '/') {
                        window.location.replace('/');
                    }
                }
            }
        };

        // Check auth status once on mount
        checkAuthStatus();

        // Listen for storage changes (e.g., from other tabs or manual logout)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'isLoggedIn' || e.key === null) {
                checkAuthStatus();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Cleanup function
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInactivityTracker();
        };
    }, []);

    // Handle visibility changes (when user switches tabs) - but only check auth state, no API calls
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Quick check when user returns to tab
                const cookieLogin = document.cookie.includes('isLoggedIn=true');
                const localStorageLogin = localStorage.getItem("isLoggedIn") === "true";

                if (localStorageLogin !== cookieLogin) {
                    console.log('Auth state mismatch detected on tab focus');

                    if (!cookieLogin) {
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('userEmail');
                        localStorage.removeItem('userRole');
                        setIsLoggedIn(false);

                        if (window.location.pathname !== '/') {
                            window.location.replace('/');
                        }
                    } else {
                        localStorage.setItem('isLoggedIn', 'true');
                        setIsLoggedIn(true);
                    }
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const AppBarStyled = styled(AppBar)(({ theme }) => ({
        boxShadow: 'none',
        background: theme.palette.background.paper,
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
    }));

    const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
        width: '100%',
        color: theme.palette.text.secondary,
    }));

    return (
        <AppBarStyled position="sticky" color="default">
            <Analytics />
            <ToolbarStyled sx={{ position: 'relative' }}>
                <IconButton
                    color="inherit"
                    aria-label="menu"
                    onClick={toggleMobileSidebar}
                    sx={{
                        display: {
                            lg: "none",
                            xs: "inline",
                        },
                    }}
                >
                    <IconMenu width="20" height="20" />
                </IconButton>

                <IconButton
                    size="large"
                    aria-label="show notifications"
                    color="inherit"
                >
                    <Badge variant="dot" color="primary">
                        <IconBellRinging size="21" stroke="1.5" />
                    </Badge>
                </IconButton>

                {isLoggedIn && (
                    <Box
                        sx={{
                            position: 'absolute',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: {
                                xs: 'block',
                                lg: 'none',
                            },
                        }}
                    >
                        <Logo />
                    </Box>
                )}

                <Box flexGrow={1} />

                <Stack spacing={1} direction="row" alignItems="center">
                    {isLoggedIn ? (
                        <Profile />
                    ) : (
                        <Button
                            variant="contained"
                            component={Link}
                            href="/authentication/login"
                            disableElevation
                            color="primary"
                        >
                            Login / Sign Up
                        </Button>
                    )}
                </Stack>
            </ToolbarStyled>
        </AppBarStyled>
    );
};

Header.propTypes = {
    sx: PropTypes.object,
};

export default Header;
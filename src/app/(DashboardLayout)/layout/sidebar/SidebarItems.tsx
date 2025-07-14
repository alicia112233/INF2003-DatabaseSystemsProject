import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    List,
    CircularProgress,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    ListItemButton,
} from '@mui/material';
import { getMenuItems } from './MenuItems';
import Logo from '../shared/logo/Logo';

interface SidebarItemsProps {
    genres: Array<{ id: number; name: string }>;
    genresLoading: boolean;
}

const SidebarItems: React.FC<SidebarItemsProps> = ({ genres, genresLoading }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('customer');
    const [showAllGenres, setShowAllGenres] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            if (typeof window !== 'undefined') {
                const loggedIn =
                    localStorage.getItem('isLoggedIn') === 'true' ||
                    document.cookie.includes('isLoggedIn=true');
                const role =
                    localStorage.getItem('userRole') ||
                    document.cookie.match(/userRole=([^;]+)/)?.[1] ||
                    'customer';

                setIsLoggedIn(loggedIn);
                setUserRole(role);
            }
        };

        checkAuth();
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const handleToggleGenres = useCallback(() => {
        setShowAllGenres((prev) => !prev);
    }, []);

    const menuItems = getMenuItems(isLoggedIn, userRole, genres, showAllGenres, handleToggleGenres);

    if (genresLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
            </Box>
        );
    }

    return (
        <Box sx={{ px: 3 }}>
            <Box px={3}>
                <Logo />
            </Box>

            <List sx={{ pt: 0 }} className="sidebarNav" key={`sidebar-${showAllGenres}`}>
                {menuItems.map((item) => {
                    if (item.navlabel) {
                        return (
                            <ListSubheader key={item.subheader}>
                                {item.subheader}
                            </ListSubheader>
                        );
                    }

                    // Render raw content like <Upgrade />
                    if (item.content && !item.title && !item.href && !item.onClick) {
                        return (
                            <Box key={item.id} sx={{ width: '100%', px: 2, py: 1 }}>
                                {item.content}
                            </Box>
                        );
                    }

                    // Render clickable items using ListItemButton
                    if (item.href || item.onClick) {
                        return (
                            <ListItemButton
                                key={item.id}
                                component={item.href && !item.onClick ? 'a' : 'div'}
                                href={item.href && !item.onClick ? item.href : undefined}
                                onClick={item.onClick}
                            >
                                {item.icon && (
                                    <ListItemIcon>{React.createElement(item.icon)}</ListItemIcon>
                                )}
                                <ListItemText primary={item.title} />
                                {item.content && item.title && (
                                    <Box sx={{ ml: 'auto' }}>{item.content}</Box>
                                )}
                            </ListItemButton>
                        );
                    }

                    // Non-clickable items (e.g., genre headers)
                    return (
                        <ListItem key={item.id}>
                            {item.icon && (
                                <ListItemIcon>{React.createElement(item.icon)}</ListItemIcon>
                            )}
                            <ListItemText primary={item.title} />
                            {item.content && item.title && (
                                <Box sx={{ ml: 'auto' }}>{item.content}</Box>
                            )}
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
};

export default SidebarItems;
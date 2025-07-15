import {
    IconLayoutDashboard,
    IconDeviceGamepad,
    IconUsers,
    IconDiscount,
    IconCalendarStats,
    IconChartLine,
    IconChevronDown,
    IconChevronUp,
} from "@tabler/icons-react";
import { Upgrade } from "./Upgrade";
import { uniqueId } from "lodash";
import { Box } from "@mui/material";
import React from "react";

interface MenuItem {
    navlabel?: boolean;
    subheader?: string;
    id?: string;
    title?: string;
    icon?: React.ElementType | null;
    href?: string;
    content?: React.ReactNode;
    isShowMoreButton?: boolean;
    onClick?: () => void;
}

interface Genre {
    id: number;
    name: string;
}

export const getMenuItems = (
    isLoggedIn: boolean, 
    userRole: string = 'customer',
    genres: Genre[] = [],
    showAllGenres: boolean = false,
    handleToggleGenres?: () => void
): MenuItem[] => {
    // Common menu items for all users
    const commonItems: MenuItem[] = [
        {
            id: uniqueId(),
            title: "Home",
            icon: IconLayoutDashboard,
            href: "/",
        },
        {
            id: uniqueId(),
            title: "All Games",
            icon: IconDeviceGamepad,
            href: "/products",
        },
    ];

    // Generate genre menu items dynamically
    const genreItems: MenuItem[] = [];
    const maxGenresToShow = 5;
    
    // Determine how many genres to show
    const genresToShow = showAllGenres ? genres : genres.slice(0, maxGenresToShow);
    
    // Add genre items based on showAllGenres state
    genresToShow.forEach((genre) => {
        genreItems.push({
            id: `genre-${genre.id}`,
            title: genre.name,
            icon: IconDeviceGamepad,
            href: `/view-${genre.name.toLowerCase().replace(/\s+/g, '-')}-games`,
        });
    });
    
    // Add Show More/Show Less button if there are more genres than the limit
    if (genres.length > maxGenresToShow && handleToggleGenres) {
        genreItems.push({
            id: 'toggle-genres',
            title: showAllGenres ? 'Show Less' : 'Show More',
            icon: showAllGenres ? IconChevronUp : IconChevronDown,
            onClick: handleToggleGenres,
            isShowMoreButton: true,
        });
    } else {
        console.log('Not adding toggle button:', {
            genresLength: genres.length,
            maxGenresToShow,
            hasHandler: !!handleToggleGenres
        });
    }

    // Admin-specific menu items
    const adminItems: MenuItem[] = [
        {
            id: uniqueId(),
            title: "Admin Dashboard",
            icon: IconLayoutDashboard,
            href: "/admin-dashboard",
        },
        {
            id: uniqueId(),
            title: "All Games",
            icon: IconDeviceGamepad,
            href: "/products",
        },
        {
            navlabel: true,
            subheader: "ORDERS",
        },
        {
            id: uniqueId(),
            title: "Orders Management",
            icon: IconDeviceGamepad,
            href: "/orders-management",
        },
        {
            id: uniqueId(),
            title: "Rental Management",
            icon: IconCalendarStats,
            href: "/rental-management",
        },
        {
            navlabel: true,
            subheader: "ADMIN MANAGEMENT",
        },
        {
            id: uniqueId(),
            title: "Users",
            icon: IconUsers,
            href: "/user-management",
        },
        {
            id: uniqueId(),
            title: 'Promotions',
            icon: IconDiscount,
            href: '/promotion-management',
        },
        {
            navlabel: true,
            subheader: 'SYSTEM',
        },
        {
            id: uniqueId(),
            title: 'Performance',
            icon: IconChartLine,
            href: '/performance-dashboard',
        },
    ];

    // Customer-specific menu items
    const customerItems: MenuItem[] = [
        {
            navlabel: true,
            subheader: "MY ACCOUNT",
        },
        {
            id: uniqueId(),
            title: "My Orders",
            icon: IconDeviceGamepad,
            href: "/my-orders",
        },
        {
            id: uniqueId(),
            title: "My Rentals",
            icon: IconCalendarStats,
            href: "/my-rentals",
        },
        {
            navlabel: true,
            subheader: "GENRES",

        },
        ...genreItems
    ];

    // Guest items (non-logged in users)
    const guestItems: MenuItem[] = [
        {
            navlabel: true,
            subheader: "GENRES",
        },
        ...genreItems
    ];

    // Upgrade component to be placed at the bottom (only for guests)
    const upgradeItem: MenuItem = {
        id: uniqueId(),
        icon: null,
        content: React.createElement(Box, { px: 2 }, React.createElement(Upgrade)),
    };

    const spacer: MenuItem = {
        navlabel: true,
        subheader: " ",
    };

    let finalItems: MenuItem[];
    if (!isLoggedIn) {
        finalItems = [...commonItems, ...guestItems, spacer, upgradeItem];
    } else if (userRole === 'admin') {
        finalItems = [...adminItems];
    } else {
        finalItems = [...commonItems, ...customerItems];
    }

    return finalItems;
};
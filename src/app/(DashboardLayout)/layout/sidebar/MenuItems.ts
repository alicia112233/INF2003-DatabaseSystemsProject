import {
    IconLayoutDashboard,
    IconDeviceGamepad,
    IconUsers,
    IconReportAnalytics,
    IconDiscount,
    IconCalendarStats,
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
}

export const getMenuItems = (isLoggedIn: boolean, userRole: string = 'customer'): MenuItem[] => {
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

    // Guest-specific menu items (without Upgrade)
    const guestItems: MenuItem[] = [
        {
            navlabel: true,
            subheader: "Genres",
        },
        {
            id: uniqueId(),
            title: "Action",
            icon: IconDeviceGamepad,
            href: "/view-action-games",
        },
        {
            id: uniqueId(),
            title: "Adventure",
            icon: IconDeviceGamepad,
            href: "/view-adventure-games",
        },
        {
            id: uniqueId(),
            title: "Horror",
            icon: IconDeviceGamepad,
            href: "/view-horror-games",
        },
    ];

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
            id: uniqueId(),
            title: "Reports",
            icon: IconReportAnalytics,
            href: "/reports",
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
            subheader: "Genres",
        },
        {
            id: uniqueId(),
            title: "Action",
            icon: IconDeviceGamepad,
            href: "/view-action-games",
        },
        {
            id: uniqueId(),
            title: "Adventure",
            icon: IconDeviceGamepad,
            href: "/view-adventure-games",
        },
        {
            id: uniqueId(),
            title: "Horror",
            icon: IconDeviceGamepad,
            href: "/view-horror-games",
        },
    ];

    // Upgrade component to be placed at the bottom (only for guests)
    const upgradeItem: MenuItem = {
        id: uniqueId(),
        title: "Upgrade",
        icon: null,
        href: "#",
        content: React.createElement(Box, { px: 2 }, React.createElement(Upgrade)),
    };

    const spacer: MenuItem = {
        navlabel: true,
        subheader: " ",
    };

    if (!isLoggedIn) {
        return [...commonItems, ...guestItems, spacer, upgradeItem];
    } else if (userRole === 'admin') {
        return [...adminItems];
    } else {
        return [...commonItems, ...customerItems];
    }
};
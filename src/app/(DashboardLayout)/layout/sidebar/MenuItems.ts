import {
  IconLayoutDashboard,
  IconMoodHappy,
  IconShoppingCart,
  IconDeviceGamepad,
  IconUsers,
  IconReportAnalytics,
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
  ];

  // Guest-specific menu items (without Upgrade)
  const guestItems: MenuItem[] = [
    {
      navlabel: true,
      subheader: "GAMES",
    },
    {
      id: uniqueId(),
      title: "Digital Games",
      icon: IconDeviceGamepad,
      href: "/view-digitals",
    },
    {
      id: uniqueId(),
      title: "Board Games",
      icon: IconDeviceGamepad,
      href: "/view-boards",
    },
    {
      id: uniqueId(),
      title: "Card Games",
      icon: IconDeviceGamepad,
      href: "/view-cards",
    },
    {
      navlabel: true,
      subheader: "CATEGORIES",
    },
    {
      id: uniqueId(),
      title: "Top Sellers",
      icon: IconDeviceGamepad,
      href: "/view-top-sellers",
    },
    {
      id: uniqueId(),
      title: "New Releases",
      icon: IconDeviceGamepad,
      href: "/view-new-releases",
    },
    {
      id: uniqueId(),
      title: "Upcoming Games",
      icon: IconDeviceGamepad,
      href: "/view-upcoming",
    },
    {
      navlabel: true,
      subheader: "Genres",
    },
    {
      id: uniqueId(),
      title: "All",
      icon: IconDeviceGamepad,
      href: "/view-games",
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
      navlabel: true,
      subheader: "GAMES",
    },
    {
      id: uniqueId(),
      title: "Add New Games",
      icon: IconDeviceGamepad,
      href: "/create-games",
    },
    {
      id: uniqueId(),
      title: "View All Games",
      icon: IconDeviceGamepad,
      href: "/view-games",
    },
    {
      id: uniqueId(),
      title: "Update Games",
      icon: IconDeviceGamepad,
      href: "/update-game",
    },
    {
      id: uniqueId(),
      title: "Delete Games",
      icon: IconDeviceGamepad,
      href: "/delete-game",
    },
    {
      navlabel: true,
      subheader: "ORDERS MANAGEMENT",
    },
    {
      id: uniqueId(),
      title: "View All Orders",
      icon: IconDeviceGamepad,
      href: "/view-orders",
    },
    {
      id: uniqueId(),
      title: "Update Orders",
      icon: IconDeviceGamepad,
      href: "/update-order",
    },
    {
      id: uniqueId(),
      title: "Delete Orders",
      icon: IconDeviceGamepad,
      href: "/delete-order",
    },
    {
      navlabel: true,
      subheader: "ADMIN",
    },
    {
      id: uniqueId(),
      title: "User Management",
      icon: IconUsers,
      href: "/user-management",
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
      subheader: "GAMES",
    },
    {
      id: uniqueId(),
      title: "Digital Games",
      icon: IconDeviceGamepad,
      href: "/view-digitals",
    },
    {
      id: uniqueId(),
      title: "Board Games",
      icon: IconDeviceGamepad,
      href: "/view-boards",
    },
    {
      id: uniqueId(),
      title: "Card Games",
      icon: IconDeviceGamepad,
      href: "/view-cards",
    },
    {
      navlabel: true,
      subheader: "CATEGORIES",
    },
    {
      id: uniqueId(),
      title: "Top Sellers",
      icon: IconDeviceGamepad,
      href: "/view-top-sellers",
    },
    {
      id: uniqueId(),
      title: "New Releases",
      icon: IconDeviceGamepad,
      href: "/view-new-releases",
    },
    {
      id: uniqueId(),
      title: "Upcoming Games",
      icon: IconDeviceGamepad,
      href: "/view-upcoming",
    },
    {
      navlabel: true,
      subheader: "Genres",
    },
    {
      id: uniqueId(),
      title: "All",
      icon: IconDeviceGamepad,
      href: "/view-games",
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

  // Add a spacer before the upgrade item to push it to the bottom
  const spacer: MenuItem = {
    navlabel: true,
    subheader: " ", // Empty space
  };

  if (!isLoggedIn) {
    return [...commonItems, ...guestItems, spacer, upgradeItem];
  } else if (userRole === 'admin') {
    return [...adminItems];
  } else {
    return [...commonItems, ...customerItems];
  }
};
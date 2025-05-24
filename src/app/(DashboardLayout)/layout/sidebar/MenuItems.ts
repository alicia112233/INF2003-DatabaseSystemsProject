import {
  IconLayoutDashboard,
  IconLogin,
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
      id: uniqueId(),
      title: "Login",
      icon: IconLogin,
      href: "/authentication/login",
    },
    {
      navlabel: true,
      subheader: "GAMES",
    },
    {
      id: uniqueId(),
      title: "View All Games",
      icon: IconDeviceGamepad,
      href: "/view-games",
    },
    {
      navlabel: true,
      subheader: "DEVICES",
    },
    {
      id: uniqueId(),
      title: "View All Devices",
      icon: IconDeviceGamepad,
      href: "/view-devices",
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
      subheader: "DEVICES",
    },
    {
      id: uniqueId(),
      title: "Add New Devices",
      icon: IconDeviceGamepad,
      href: "/create-devices",
    },
    {
      id: uniqueId(),
      title: "View All Devices",
      icon: IconDeviceGamepad,
      href: "/view-devices",
    },
    {
      id: uniqueId(),
      title: "Update Device",
      icon: IconDeviceGamepad,
      href: "/update-devices",
    },
    {
      id: uniqueId(),
      title: "Delete Device",
      icon: IconDeviceGamepad,
      href: "/delete-devices",
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
      title: "View All Games",
      icon: IconDeviceGamepad,
      href: "/view-games",
    },
    {
      navlabel: true,
      subheader: "DEVICES",
    },
    {
      id: uniqueId(),
      title: "View All Devices",
      icon: IconDeviceGamepad,
      href: "/view-devices",
    },
    {
      navlabel: true,
      subheader: "MY ACCOUNT",
    },
    {
      id: uniqueId(),
      title: "My Purchases",
      icon: IconShoppingCart,
      href: "/my-purchases",
    },
    {
      id: uniqueId(),
      title: "Wishlist",
      icon: IconMoodHappy,
      href: "/wishlist",
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
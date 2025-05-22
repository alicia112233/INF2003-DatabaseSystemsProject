import {
  IconAperture,
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconMoodHappy,
  IconTypography,
  IconUserPlus,
  IconLogout,
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

export const getMenuItems = (isLoggedIn: boolean): MenuItem[] => [
  {
    navlabel: true,
    subheader: "STORE",
  },
  {
    id: uniqueId(),
    title: "Home",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    id: uniqueId(),
    title: "Wish List",
    icon: IconLayoutDashboard,
    href: "/wishlist",
  },
  {
    id: uniqueId(),
    title: "Rewards",
    icon: IconLayoutDashboard,
    href: "/rewards",
  },
  {
    navlabel: true,
    subheader: "INVENTORY",
  },
  {
    id: uniqueId(),
    title: "Purchases",
    icon: IconTypography,
    href: "/utilities/typography",
  },
  {
    id: uniqueId(),
    title: "Borrows",
    icon: IconCopy,
    href: "/utilities/shadow",
  },
  {
    navlabel: true,
    subheader: "NOTIFICATION",
  },
  {
    id: uniqueId(),
    title: "Messages",
    icon: IconMoodHappy,
    href: "/icons",
  },
  {
    id: uniqueId(),
    title: "Support",
    icon: IconAperture,
    href: "/sample-page",
  },
  {
    navlabel: true,
    subheader: "AUTH",
  },
  ...(!isLoggedIn
    ? [
        {
          id: uniqueId(),
          title: "Login",
          icon: IconLogin,
          href: "/authentication/login",
        },
        {
          id: uniqueId(),
          title: "Register",
          icon: IconUserPlus,
          href: "/authentication/register",
        },
        {
          id: uniqueId(),
          title: "Upgrade",
          icon: null,
          href: "#",
          content: React.createElement(Box, { px: 2 }, React.createElement(Upgrade)),
        }
      ]
    : [
        {
          id: uniqueId(),
          title: "Logout",
          icon: IconLogout,
          href: "/",
        },
      ]),
];
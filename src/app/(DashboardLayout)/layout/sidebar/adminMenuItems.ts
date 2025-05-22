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
    subheader: "HOME",
  },
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    navlabel: true,
    subheader: "UTILITIES",
  },
  {
    id: uniqueId(),
    title: "Typography",
    icon: IconTypography,
    href: "/utilities/typography",
  },
  {
    id: uniqueId(),
    title: "Shadow",
    icon: IconCopy,
    href: "/utilities/shadow",
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
          href: "#",
        },
      ]),
  {
    navlabel: true,
    subheader: "EXTRA",
  },
  {
    id: uniqueId(),
    title: "Icons",
    icon: IconMoodHappy,
    href: "/icons",
  },
  {
    id: uniqueId(),
    title: "Sample Page",
    icon: IconAperture,
    href: "/sample-page",
  },
];
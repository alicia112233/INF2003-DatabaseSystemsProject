'use client';
import React from 'react';
import { Box, List } from '@mui/material';
import NavItem from './NavItem';
import NavGroup from './NavGroup';

interface MenuItem {
  navlabel?: boolean;
  subheader?: string;
  id?: string;
  title?: string;
  icon?: React.ElementType | null;
  href?: string;
  content?: React.ReactNode;
}

interface SidebarItemsProps {
  menuItems: MenuItem[];
}

const SidebarItems = ({ menuItems }: SidebarItemsProps) => {
  return (
    <Box sx={{ px: 3 }}>
      <List sx={{ pt: 0 }} component="div">
        {menuItems.map((item) => {
          if (item.navlabel) {
            return <NavGroup key={item.subheader} item={item} />;
          } else {
            return <NavItem key={item.id} item={item} />;
          }
        })}
      </List>
    </Box>
  );
};

export default SidebarItems;
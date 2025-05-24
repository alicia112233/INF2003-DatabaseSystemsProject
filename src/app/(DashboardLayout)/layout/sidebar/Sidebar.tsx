'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Box, Drawer, useMediaQuery } from '@mui/material';
import Logo from '../shared/logo/Logo';
import SidebarItems from './SidebarItems';
import { getMenuItems } from './MenuItems';

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
  isSidebarOpen: boolean;
}

const Sidebar = ({ isMobileSidebarOpen, onSidebarClose, isSidebarOpen }: ItemType) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('customer');
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const pathname = usePathname();

  useEffect(() => {
    // Check login status and user role from localStorage
    const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
    const role = localStorage.getItem('userRole') || 'customer';
    
    setIsLoggedIn(loginStatus);
    setUserRole(role);
  }, [pathname]);

  const menuItems = getMenuItems(isLoggedIn, userRole);

  const sidebarWidth = '270px';

  if (lgUp) {
    return (
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
        }}
      >
        {/* Sidebar for desktop */}
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="permanent"
          slotProps={{
            paper: {
              sx: {
                width: sidebarWidth,
                boxSizing: 'border-box',
              },
            },
          }}
        >
          {/* Sidebar content */}
          <Box
            sx={{
              height: '100%',
            }}
          >
            <Box px={3}>
              <Logo />
            </Box>
            <SidebarItems menuItems={menuItems} />
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      slotProps={{
        paper: {
          sx: {
            width: sidebarWidth,
            boxShadow: (theme) => theme.shadows[8],
          },
        },
      }}
    >
      {/* Mobile sidebar content */}
      <Box px={2}>
        <Logo />
      </Box>
      <SidebarItems menuItems={menuItems} />
    </Drawer>
  );
};

export default Sidebar;
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
    const checkAuthStatus = () => {
      try {
        // Check both localStorage and cookies for auth state
        const localStorageLogin = localStorage.getItem("isLoggedIn") === "true";
        const cookieLogin = document.cookie.includes('isLoggedIn=true');
        
        // Extract role from cookies if available
        const cookieRoleMatch = document.cookie.match(/userRole=([^;]+)/);
        const cookieRole = cookieRoleMatch ? decodeURIComponent(cookieRoleMatch[1]) : 'customer';
        
        // If localStorage says logged in but cookies don't, clear localStorage
        if (localStorageLogin && !cookieLogin) {
          console.log('Sidebar: Mismatch between localStorage and cookies - clearing localStorage');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userRole');
          setIsLoggedIn(false);
          setUserRole('customer');
          
          // Redirect to home if on protected route
          if (pathname !== '/') {
            window.location.replace('/');
          }
          return;
        }
        
        // If cookies say logged in but localStorage doesn't, sync localStorage
        if (!localStorageLogin && cookieLogin) {
          console.log('Sidebar: Syncing localStorage with cookies');
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userRole', cookieRole);
        }
        
        // Use cookies as the source of truth
        const finalLoginStatus = cookieLogin;
        const finalRole = cookieLogin ? cookieRole : 'customer';
        
        setIsLoggedIn(finalLoginStatus);
        setUserRole(finalRole);
        
      } catch (error) {
        console.error('Sidebar: Error checking auth status:', error);
        
        // Fallback to checking cookies only
        const cookieLogin = document.cookie.includes('isLoggedIn=true');
        const cookieRoleMatch = document.cookie.match(/userRole=([^;]+)/);
        const cookieRole = cookieRoleMatch ? decodeURIComponent(cookieRoleMatch[1]) : 'customer';
        
        setIsLoggedIn(cookieLogin);
        setUserRole(cookieLogin ? cookieRole : 'customer');
        
        if (!cookieLogin) {
          // Clear localStorage if cookies indicate not logged in
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userRole');
          
          // Redirect if on protected route
          if (pathname !== '/') {
            window.location.replace('/');
          }
        }
      }
    };

    // Check auth status on mount and pathname change
    checkAuthStatus();

    // Listen for storage changes (e.g., from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isLoggedIn' || e.key === 'userRole' || e.key === null) {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname]);

  // Handle visibility changes (when user switches tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Quick check when user returns to tab
        const cookieLogin = document.cookie.includes('isLoggedIn=true');
        const localStorageLogin = localStorage.getItem("isLoggedIn") === "true";
        
        const cookieRoleMatch = document.cookie.match(/userRole=([^;]+)/);
        const cookieRole = cookieRoleMatch ? decodeURIComponent(cookieRoleMatch[1]) : 'customer';
        const localStorageRole = localStorage.getItem('userRole') || 'customer';
        
        if (localStorageLogin !== cookieLogin || localStorageRole !== cookieRole) {
          console.log('Sidebar: Auth state mismatch detected on tab focus');
          
          if (!cookieLogin) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userRole');
            setIsLoggedIn(false);
            setUserRole('customer');
            
            if (pathname !== '/') {
              window.location.replace('/');
            }
          } else {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userRole', cookieRole);
            setIsLoggedIn(true);
            setUserRole(cookieRole);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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
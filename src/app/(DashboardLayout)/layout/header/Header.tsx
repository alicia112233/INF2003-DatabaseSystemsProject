import React, { useEffect, useState } from 'react';
import { Box, AppBar, Toolbar, styled, Stack, IconButton, Badge, Button } from '@mui/material';
import PropTypes from 'prop-types';
// components
import Profile from './Profile';
import { IconBellRinging, IconMenu } from '@tabler/icons-react';
import Link from 'next/link';
import { Logo } from 'react-mui-sidebar';
import { setupInactivityTracker, clearInactivityTracker } from '@/utils/inactivityTracker';
import { Analytics } from "@vercel/analytics/next"

interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

// LOGGED IN HEADER
const Header = ({ toggleMobileSidebar }: ItemType) => {
  // const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  // const lgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const loggedIn = localStorage.getItem("isLoggedIn");
    console.log("userEmail:", userEmail);
    console.log("isLoggedIn:", loggedIn);
    
    const loginStatus = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loginStatus);

    // Setup inactivity tracker if user is logged in
    if (loginStatus) {
      setupInactivityTracker();
    }

    // Cleanup function
    return () => {
      clearInactivityTracker();
    };
  }, []);

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: 'none',
    background: theme.palette.background.paper,
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    [theme.breakpoints.up('lg')]: {
      minHeight: '70px',
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: '100%',
    color: theme.palette.text.secondary,
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <Analytics/>
      <ToolbarStyled sx={{ position: 'relative' }}>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: "none",
              xs: "inline",
            },
          }}
        >
          <IconMenu width="20" height="20" />
        </IconButton>

        <IconButton
          size="large"
          aria-label="show notifications"
          color="inherit"
        >
          <Badge variant="dot" color="primary">
            <IconBellRinging size="21" stroke="1.5" />
          </Badge>
        </IconButton>

        {isLoggedIn && (
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: {
                xs: 'block',
                lg: 'none',
              },
            }}
          >
            <Logo img="/images/logos/dark-logo.svg" component={Link} to="/">
              Game Haven
            </Logo>
          </Box>
        )}

        <Box flexGrow={1} />

        <Stack spacing={1} direction="row" alignItems="center">
          {isLoggedIn ? (
            <Profile />
          ) : (
            <Button
              variant="contained"
              component={Link}
              href="/authentication/login"
              disableElevation
              color="primary"
            >
              Login / Sign Up
            </Button>
          )}
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};

export default Header;
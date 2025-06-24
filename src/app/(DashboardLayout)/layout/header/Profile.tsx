import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Menu,
  Button,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,

} from "@mui/material";

import { IconShoppingCart, IconStar, IconUser } from "@tabler/icons-react";
import { CalendarMonth, Inventory, Settings } from "@mui/icons-material";
import { useRouter } from "next/navigation";

const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState("/images/profile/user-1.jpg");
  const router = useRouter();

  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const handleMenuItemClick = (path: string) => {
    handleClose2();
    router.push(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    window.location.href = "/"; // or use router.push("/")
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setAvatarSrc(data.avatarUrl || "/images/profile/user-1.jpg");
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <Box>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<IconShoppingCart size={20} />}
      >
        View Cart
      </Button>

      <IconButton
        size="large"
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === "object" && {
            color: "primary.main",
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          src={avatarSrc}
          alt="profile image"
          sx={{
            width: 35,
            height: 35,
          }}
        />
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{
          "& .MuiMenu-paper": {
            width: "250px",
          },
        }}
      >
        <MenuItem onClick={() => handleMenuItemClick('/profile')}>
          <ListItemIcon>
            <IconUser width={20} />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('/wishlist')}>
          <ListItemIcon>
            <IconStar width={20} />
          </ListItemIcon>
          <ListItemText>My Wish List</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Inventory width={20} />
          </ListItemIcon>
          <ListItemText>My Orders</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <CalendarMonth width={20} />
          </ListItemIcon>
          <ListItemText>My Rentals</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Settings width={20} />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Box mt={1} py={1} px={2}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleLogout}
            fullWidth
          >
            Logout
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;

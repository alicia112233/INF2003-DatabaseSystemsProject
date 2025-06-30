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
    Badge,
} from "@mui/material";

import { IconShoppingCart, IconStar, IconUser } from "@tabler/icons-react";
import { CalendarMonth, Inventory, Settings } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

// Global variable to track if profile has been fetched
let profileFetched = false;
let cachedAvatarUrl: string | null = null;
let cachedIsAdmin: boolean | null = null;

const Profile = () => {
    const [anchorEl2, setAnchorEl2] = useState(null);
    const [avatarSrc, setAvatarSrc] = useState(
        cachedAvatarUrl || "/images/profile/user-1.jpg"
    );
    const [isAdmin, setIsAdmin] = useState(cachedIsAdmin || false);
    const router = useRouter();
    const { getCartItemCount } = useCart();

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
        // Reset the global cache on logout
        profileFetched = false;
        cachedAvatarUrl = null;
        cachedIsAdmin = null;
        window.location.href = "/";
    };

    useEffect(() => {
        if (profileFetched) {
            console.log("Profile already fetched globally, using cached data");
            if (cachedAvatarUrl) {
                setAvatarSrc(cachedAvatarUrl);
            }
            if (cachedIsAdmin !== null) {
                setIsAdmin(cachedIsAdmin);
            }
            return;
        }

        console.log("Fetching profile for the first time globally...");
        profileFetched = true;

        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/profile");
                if (!res.ok) throw new Error("Failed to fetch profile");
                const data = await res.json();
                const avatarUrl = data.avatarUrl || "/images/profile/user-1.jpg";
                const userIsAdmin = data.is_admin === 'T' || data.is_admin === true;

                // Cache the result globally
                cachedAvatarUrl = avatarUrl;
                cachedIsAdmin = userIsAdmin;
                setAvatarSrc(avatarUrl);
                setIsAdmin(userIsAdmin);
                console.log("Profile fetched and cached successfully");
            } catch (err) {
                console.error("Error fetching profile:", err);
                // Reset on error so it can retry
                profileFetched = false;
            }
        };

        fetchProfile();
    }, []);

    const cartItemCount = getCartItemCount();

    return (
        <Box>
            {/* Only show cart button if user is not an admin */}
            {!isAdmin && (
                <Badge badgeContent={cartItemCount} color="error">
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<IconShoppingCart size={20} />}
                        onClick={() => router.push("/cart")}
                    >
                        View Cart
                    </Button>
                </Badge>
            )}

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
                {/* Only show customer-specific menu items if user is not an admin */}
                {!isAdmin && (
                    <>
                        <MenuItem onClick={() => handleMenuItemClick('/wishlist')}>
                            <ListItemIcon>
                                <IconStar width={20} />
                            </ListItemIcon>
                            <ListItemText>My Wish List</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => handleMenuItemClick('/my-orders')}>
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
                    </>
                )}
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
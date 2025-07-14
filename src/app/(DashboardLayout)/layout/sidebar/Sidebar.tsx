import React from 'react';
import { useMediaQuery, Box, Drawer } from '@mui/material';
import SidebarItems from './SidebarItems';
import { useGenres } from '@/hooks/useGenres';

interface ItemType {
    isMobileSidebarOpen: boolean;
    onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
    isSidebarOpen: boolean;
}

const Sidebar = ({ isMobileSidebarOpen, onSidebarClose, isSidebarOpen }: ItemType) => {
    const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
    const { genres, loading: genresLoading } = useGenres();

    const sidebarWidth = "270px";

    if (lgUp) {
        return (
            <Box
                sx={{
                    width: sidebarWidth,
                    flexShrink: 0,
                }}
            >
                <Drawer
                    anchor="left"
                    open={isSidebarOpen}
                    variant="persistent"
                    PaperProps={{
                        sx: {
                            width: sidebarWidth,
                            boxSizing: "border-box",
                        },
                    }}
                >
                    <Box
                        sx={{
                            height: "100%",
                        }}
                    >
                        <SidebarItems genres={genres} genresLoading={genresLoading} />
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
            PaperProps={{
                sx: {
                    width: sidebarWidth,
                    boxShadow: (theme) => theme.shadows[8],
                },
            }}
        >
            <SidebarItems genres={genres} genresLoading={genresLoading} />
        </Drawer>
    );
};

export default Sidebar;
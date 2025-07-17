import { Box, Typography, Button } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

export const Upgrade = () => {
    return (
        <Box
            display='flex'
            alignItems="center"
            gap={2}
            sx={{ 
                mt: 3, 
                p: 3, 
                bgcolor: 'primary.light', 
                borderRadius: '8px',
                position: 'relative',
                overflow: 'visible'
            }}
        >
            <Box>
                <Typography variant="h5" sx={{ width: "95px" }} fontSize='16px' mb={1}>No Account Yet?</Typography>
                <Button 
                    color="primary" 
                    disableElevation 
                    component={Link} 
                    href="/authentication/register" 
                    variant="contained" 
                    aria-label="register" 
                    size="small"
                >
                    Sign Up
                </Button>
            </Box>
            <Box 
                sx={{
                    position: 'absolute',
                    right: '-20px', // Adjust this value to control how much the image overflows
                    top: '-35px',
                    zIndex: 1 // Ensure the image appears above other elements
                }}
            >
                <Image 
                    alt="Remy Sharp" 
                    src='/images/backgrounds/rocket.png' 
                    width={100} 
                    height={100}
                />
            </Box>
        </Box>
    );
};
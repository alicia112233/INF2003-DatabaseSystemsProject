'use client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/utils/theme';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { SnackbarProvider } from '@/contexts/SnackbarContext';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <SnackbarProvider>
                        <CartProvider>
                            <WishlistProvider>
                                {children}
                            </WishlistProvider>
                        </CartProvider>
                    </SnackbarProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
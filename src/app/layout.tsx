'use client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/utils/theme';
import { CartProvider } from '@/contexts/CartContext';

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
                    <CartProvider>
                        {children}
                    </CartProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Logout() {
    const router = useRouter();

    useEffect(() => {
        const performLogout = async () => {
            try {
                // Clear localStorage
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userRole');
                localStorage.removeItem('customer-cart');

                // Clear cookies via API
                await fetch('/api/logout', {
                    method: 'POST',
                    credentials: 'include',
                });

                // Clear cookies manually as backup
                document.cookie = 'isLoggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'userEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                // Always redirect to home page
                router.push('/');
            }
        };

        performLogout();
    }, [router]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '18px'
        }}>
            <p>Logging out...</p>
        </div>
    );
}
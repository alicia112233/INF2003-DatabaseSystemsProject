'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    // Clear all user data from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userGender');
    localStorage.removeItem('userRole');
    
    // Redirect to login page
    router.push('/authentication/login');
  }, [router]);

  return (
    <div>
      <p>Logging out...</p>
    </div>
  );
}
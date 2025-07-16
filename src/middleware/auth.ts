import { NextRequest } from 'next/server';

export interface AuthUser {
  userId: number;
  userRole: 'admin' | 'customer';
  isLoggedIn: boolean;
}

/**
 * Get authenticated user from request cookies
 * Returns null if user is not authenticated
 */
export function getAuthUser(req: NextRequest): AuthUser | null {
  const userId = req.cookies.get('userId')?.value;
  const userRole = req.cookies.get('userRole')?.value;
  const isLoggedIn = req.cookies.get('isLoggedIn')?.value;

  // Check if user is authenticated
  if (!userId || !userRole || isLoggedIn !== 'true') {
    return null;
  }

  // Validate userId is a number
  const userIdNum = parseInt(userId);
  if (isNaN(userIdNum)) {
    return null;
  }

  // Validate userRole
  if (userRole !== 'admin' && userRole !== 'customer') {
    return null;
  }

  return {
    userId: userIdNum,
    userRole: userRole as 'admin' | 'customer',
    isLoggedIn: true
  };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(req: NextRequest): boolean {
  return getAuthUser(req) !== null;
}

/**
 * Check if user is admin
 */
export function isAdmin(req: NextRequest): boolean {
  const user = getAuthUser(req);
  return user?.userRole === 'admin';
}

/**
 * Check if user is customer
 */
export function isCustomer(req: NextRequest): boolean {
  const user = getAuthUser(req);
  return user?.userRole === 'customer';
}

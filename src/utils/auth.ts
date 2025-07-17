import { cookies } from 'next/headers';

export interface AuthResult {
    isAuthenticated: boolean;
    userId?: string;
    userRole?: string;
    userEmail?: string;
}

export async function getAuthUser(): Promise<AuthResult> {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('userId')?.value;
        const userRole = cookieStore.get('userRole')?.value;
        const userEmail = cookieStore.get('userEmail')?.value;

        return {
            isAuthenticated: !!userId,
            userId,
            userRole,
            userEmail
        };
    } catch (error) {
        console.error('Error getting auth user:', error);
        return {
            isAuthenticated: false
        };
    }
}

export async function requireAuth() {
    const auth = await getAuthUser();
    if (!auth.isAuthenticated) {
        throw new Error('Authentication required');
    }
    return auth;
}

export async function requireAdmin() {
    const auth = await getAuthUser();
    if (!auth.isAuthenticated) {
        throw new Error('Authentication required');
    }
    if (auth.userRole !== 'admin') {
        throw new Error('Admin access required');
    }
    return auth;
}

export function canModifyReview(reviewUserId: string, currentUserId: string, userRole?: string): boolean {
    return reviewUserId === currentUserId || userRole === 'admin';
}

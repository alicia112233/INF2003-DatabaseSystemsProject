'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface WishlistItem {
    id: string;
    title: string;
    description?: string;
    price: number;
    image_url?: string;
}

interface WishlistState {
    items: WishlistItem[];
}

interface WishlistContextType {
    wishlist: WishlistItem[];
    addToWishlist: (item: WishlistItem) => void;
    removeFromWishlist: (itemId: string) => void;
    isInWishlist: (itemId: string) => boolean;
    getWishlistCount: () => number;
}

type WishlistAction =
    | { type: 'SET_WISHLIST'; payload: WishlistItem[] }
    | { type: 'ADD_ITEM'; payload: WishlistItem }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'CLEAR_WISHLIST' };

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
    switch (action.type) {
        case 'SET_WISHLIST':
            return { items: action.payload };
        case 'ADD_ITEM':
            if (state.items.find(item => item.id === action.payload.id)) {
                return state; // Item already exists
            }
            return { items: [...state.items, action.payload] };
        case 'REMOVE_ITEM':
            return { items: state.items.filter(item => item.id !== action.payload) };
        case 'CLEAR_WISHLIST':
            return { items: [] };
        default:
            return state;
    }
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(wishlistReducer, { items: [] });

    useEffect(() => {
        // Load wishlist from localStorage on mount
        const savedWishlist = localStorage.getItem('customer-wishlist');
        if (savedWishlist) {
            try {
                const parsedWishlist = JSON.parse(savedWishlist);
                dispatch({ type: 'SET_WISHLIST', payload: parsedWishlist });
            } catch (error) {
                console.error('Error loading wishlist from localStorage:', error);
            }
        }
    }, []);

    useEffect(() => {
        // Save wishlist to localStorage whenever it changes
        localStorage.setItem('customer-wishlist', JSON.stringify(state.items));
    }, [state.items]);

    const addToWishlist = async (item: WishlistItem) => {
        try {
            // Call API to add to wishlist
            const response = await fetch('/api/wishlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ gameId: item.id }),
            });

            if (response.ok) {
                dispatch({ type: 'ADD_ITEM', payload: item });
            } else {
                console.error('Failed to add to wishlist');
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            // Still add to local state for better UX
            dispatch({ type: 'ADD_ITEM', payload: item });
        }
    };

    const removeFromWishlist = async (itemId: string) => {
        try {
            // Call API to remove from wishlist
            const response = await fetch('/api/wishlist', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ gameId: itemId }),
            });

            if (response.ok) {
                dispatch({ type: 'REMOVE_ITEM', payload: itemId });
            } else {
                console.error('Failed to remove from wishlist');
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            // Still remove from local state for better UX
            dispatch({ type: 'REMOVE_ITEM', payload: itemId });
        }
    };

    const isInWishlist = (itemId: string) => {
        return state.items.some(item => item.id === itemId);
    };

    const getWishlistCount = () => {
        return state.items.length;
    };

    const value: WishlistContextType = {
        wishlist: state.items,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        getWishlistCount,
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
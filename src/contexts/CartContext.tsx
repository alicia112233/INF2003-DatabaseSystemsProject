'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Cart, CartItem, CartContextType } from '@/types/cart';

interface CartState {
    cart: Cart | null;
    currentUserId: string | null;
}

type CartAction =
    | { type: 'SET_CART'; payload: Cart }
    | { type: 'SET_USER_ID'; payload: string | null }
    | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'id'> }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
    | { type: 'CLEAR_CART' };

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'SET_USER_ID':
            return { ...state, currentUserId: action.payload };

        case 'SET_CART':
            return { ...state, cart: action.payload };

        case 'ADD_ITEM':
            if (!state.cart) {
                const newCart: Cart = {
                    id: `cart-${state.currentUserId || 'temp'}`,
                    userId: state.currentUserId || 'temp-user',
                    items: [{
                        id: Date.now().toString(),
                        ...action.payload
                    }],
                    totalAmount: action.payload.price * action.payload.quantity,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                return { ...state, cart: newCart };
            }

            const existingItemIndex = state.cart.items.findIndex(
                item => item.productId === action.payload.productId
            );

            let updatedItems: CartItem[];
            if (existingItemIndex >= 0) {
                updatedItems = state.cart.items.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: item.quantity + action.payload.quantity }
                        : item
                );
            } else {
                updatedItems = [
                    ...state.cart.items,
                    { id: Date.now().toString(), ...action.payload }
                ];
            }

            const totalAmount = updatedItems.reduce(
                (sum, item) => sum + (item.price * item.quantity), 0
            );

            return {
                ...state,
                cart: {
                    ...state.cart,
                    items: updatedItems,
                    totalAmount,
                    updatedAt: new Date()
                }
            };

        case 'REMOVE_ITEM':
            if (!state.cart) return state;

            const filteredItems = state.cart.items.filter(item => item.id !== action.payload);
            const newTotal = filteredItems.reduce(
                (sum, item) => sum + (item.price * item.quantity), 0
            );

            return {
                ...state,
                cart: {
                    ...state.cart,
                    items: filteredItems,
                    totalAmount: newTotal,
                    updatedAt: new Date()
                }
            };

        case 'UPDATE_QUANTITY':
            if (!state.cart) return state;

            const updatedQuantityItems = state.cart.items.map(item =>
                item.id === action.payload.itemId
                    ? { ...item, quantity: action.payload.quantity }
                    : item
            );

            const updatedTotal = updatedQuantityItems.reduce(
                (sum, item) => sum + (item.price * item.quantity), 0
            );

            return {
                ...state,
                cart: {
                    ...state.cart,
                    items: updatedQuantityItems,
                    totalAmount: updatedTotal,
                    updatedAt: new Date()
                }
            };

        case 'CLEAR_CART':
            return { ...state, cart: null };

        default:
            return state;
    }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, { cart: null, currentUserId: null });

    // Function to get current user ID
    const getCurrentUserId = useCallback(async (): Promise<string | null> => {
        let userId = document.cookie.match(/userId=([^;]+)/)?.[1] || localStorage.getItem('userId');
        
        if (!userId) {
            try {
                const response = await fetch('/api/profile');
                if (response.ok) {
                    const userData = await response.json();
                    userId = userData.id?.toString();
                    if (userId) {
                        localStorage.setItem('userId', userId);
                        document.cookie = `userId=${userId}; path=/; max-age=86400`;
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            }
        }
        
        return userId;
    }, []);

    // Function to load user-specific cart
    const loadUserCart = useCallback(async (userId?: string) => {
        const targetUserId = userId || state.currentUserId;
        if (!targetUserId) return;

        const cartKey = `customer-cart-${targetUserId}`;
        const savedCartData = localStorage.getItem(cartKey);
        
        if (savedCartData) {
            try {
                const parsedData = JSON.parse(savedCartData);
                
                // Convert old format to new format if needed
                const cart: Cart = parsedData.id ? parsedData : {
                    id: `cart-${targetUserId}`,
                    userId: targetUserId,
                    items: parsedData.items || [],
                    totalAmount: parsedData.totalAmount || 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                
                dispatch({ type: 'SET_CART', payload: cart });
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
            }
        }
    }, [state.currentUserId]);

    // Initialize user and cart on mount
    useEffect(() => {
        const initializeCart = async () => {
            const userId = await getCurrentUserId();
            if (userId) {
                dispatch({ type: 'SET_USER_ID', payload: userId });
                await loadUserCart(userId);
            }
        };
        
        initializeCart();
    }, [getCurrentUserId, loadUserCart]);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (state.cart && state.currentUserId) {
            const cartKey = `customer-cart-${state.currentUserId}`;
            localStorage.setItem(cartKey, JSON.stringify(state.cart));
        }
    }, [state.cart, state.currentUserId]);

    const addToCart = (item: Omit<CartItem, 'id'>) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
    };

    const removeFromCart = (itemId: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
        } else {
            dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
        }
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const getCartTotal = () => {
        return state.cart?.totalAmount || 0;
    };

    const getCartItemCount = () => {
        return state.cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
    };

    const value: CartContextType = {
        cart: state.cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
        loadUserCart, // Add this to the context
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Cart, CartItem, CartContextType, calculateCartTotals, getAppliedPromoCodes } from '@/types/cart';

// Cart reducer actions
type CartAction =
    | { type: 'SET_CART'; payload: Cart }
    | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'id'> }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'APPLY_PROMO_CODE'; payload: { promoCode: string; items: CartItem[] } }
    | { type: 'REMOVE_PROMO_CODE'; payload: string };

// Helper function to create empty cart
const createEmptyCart = (): Cart => ({
    id: 'temp-cart-id',
    userId: 'temp-user-id',
    items: [],
    totalAmount: 0,
    totalSavings: 0,
    appliedPromoCodes: [],
    createdAt: new Date(),
    updatedAt: new Date()
});

// Initial state
const initialState: Cart = createEmptyCart();

// Cart reducer
const cartReducer = (state: Cart, action: CartAction): Cart => {
    switch (action.type) {
        case 'SET_CART':
            const payload = action.payload || createEmptyCart();
            return {
                ...payload,
                appliedPromoCodes: payload.appliedPromoCodes || []
            };
                   
        case 'ADD_ITEM':
            const existingItemIndex = state.items.findIndex(
                item => item.productId === action.payload.productId && item.type === action.payload.type
            );
                       
            let updatedItems: CartItem[];
            if (existingItemIndex >= 0) {
                updatedItems = state.items.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: item.quantity + action.payload.quantity }
                        : item
                );
            } else {
                const newItem: CartItem = {
                    ...action.payload,
                    id: `item-${Date.now()}-${Math.random()}`
                };
                updatedItems = [...state.items, newItem];
            }
                       
            const totals = calculateCartTotals(updatedItems);
            const appliedPromoCodes = getAppliedPromoCodes(updatedItems);
            
            // Also add any new promotion code from the added item
            const existingPromoCodes = state.appliedPromoCodes || [];
            let newPromoCodes = [...existingPromoCodes];
            if (action.payload.promo_code && !newPromoCodes.includes(action.payload.promo_code)) {
                newPromoCodes.push(action.payload.promo_code);
            }
                       
            return {
                ...state,
                items: updatedItems,
                totalAmount: totals.discountedTotal,
                totalSavings: totals.totalSavings,
                appliedPromoCodes: newPromoCodes,
                updatedAt: new Date()
            };
                   
        case 'REMOVE_ITEM':
            const filteredItems = state.items.filter(item => item.id !== action.payload);
            const newTotals = calculateCartTotals(filteredItems);
            const newAppliedPromoCodes = getAppliedPromoCodes(filteredItems);
                       
            return {
                ...state,
                items: filteredItems,
                totalAmount: newTotals.discountedTotal,
                totalSavings: newTotals.totalSavings,
                appliedPromoCodes: newAppliedPromoCodes || [],
                updatedAt: new Date()
            };
                   
        case 'UPDATE_QUANTITY':
            const quantityUpdatedItems = state.items.map(item =>
                item.id === action.payload.itemId
                    ? { ...item, quantity: action.payload.quantity }
                    : item
            ).filter(item => item.quantity > 0);
                       
            const quantityTotals = calculateCartTotals(quantityUpdatedItems);
            const quantityAppliedPromoCodes = getAppliedPromoCodes(quantityUpdatedItems);
                       
            return {
                ...state,
                items: quantityUpdatedItems,
                totalAmount: quantityTotals.discountedTotal,
                totalSavings: quantityTotals.totalSavings,
                appliedPromoCodes: quantityAppliedPromoCodes || [],
                updatedAt: new Date()
            };
                   
        case 'CLEAR_CART':
            return createEmptyCart();
                   
        case 'APPLY_PROMO_CODE':
            const updatedItemsWithPromo = action.payload.items;
            const promoTotals = calculateCartTotals(updatedItemsWithPromo);
            const currentPromoCodes = state.appliedPromoCodes || [];
            const promoAppliedCodes = [...currentPromoCodes, action.payload.promoCode];
            
            return {
                ...state,
                items: updatedItemsWithPromo,
                totalAmount: promoTotals.discountedTotal,
                totalSavings: promoTotals.totalSavings,
                appliedPromoCodes: promoAppliedCodes,
                updatedAt: new Date()
            };
            
        case 'REMOVE_PROMO_CODE':
            const currentCodes = state.appliedPromoCodes || [];
            const filteredPromoCodes = currentCodes.filter(code => code !== action.payload);
            
            return {
                ...state,
                appliedPromoCodes: filteredPromoCodes,
                updatedAt: new Date()
            };
                   
        default:
            return state;
    }
};

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// CartProvider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize useReducer FIRST
    const [cart, dispatch] = useReducer(cartReducer, initialState);
    
    // Get current user ID - memoized with useCallback
    const getCurrentUserId = useCallback((): string | null => {
        if (typeof window === 'undefined') return null;
        
        const userIdFromStorage = localStorage.getItem('userId');
        const userIdFromCookie = document.cookie.match(/userId=([^;]+)/)?.[1];
        
        return userIdFromStorage || userIdFromCookie || null;
    }, []);

    // Generate user-specific cart key - memoized with useCallback
    const getCartStorageKey = useCallback((): string => {
        const userId = getCurrentUserId();
        return userId ? `cart_${userId}` : 'cart_guest';
    }, [getCurrentUserId]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const loadCart = () => {
            try {
                const cartKey = getCartStorageKey();
                const savedCart = localStorage.getItem(cartKey);
                
                if (savedCart) {
                    const parsedCart = JSON.parse(savedCart);
                    const validatedCart: Cart = {
                        ...createEmptyCart(),
                        ...parsedCart,
                        appliedPromoCodes: parsedCart.appliedPromoCodes || []
                    };
                    dispatch({ type: 'SET_CART', payload: validatedCart });
                } else {
                    dispatch({ type: 'CLEAR_CART' });
                }
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
                dispatch({ type: 'CLEAR_CART' });
            }
        };

        loadCart();
    }, [getCartStorageKey]); // Now properly includes the dependency

    // Save cart to localStorage whenever cart state changes
    useEffect(() => {
        if (cart && cart.items) {
            try {
                const cartKey = getCartStorageKey();
                localStorage.setItem(cartKey, JSON.stringify(cart));
            } catch (error) {
                console.error('Error saving cart to localStorage:', error);
            }
        }
    }, [cart, getCartStorageKey]); // Include getCartStorageKey dependency

    // Listen for user login/logout events
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'userId' || e.key === 'isLoggedIn') {
                const cartKey = getCartStorageKey();
                const savedCart = localStorage.getItem(cartKey);
                
                if (savedCart) {
                    try {
                        const parsedCart = JSON.parse(savedCart);
                        const validatedCart: Cart = {
                            ...createEmptyCart(),
                            ...parsedCart,
                            appliedPromoCodes: parsedCart.appliedPromoCodes || []
                        };
                        dispatch({ type: 'SET_CART', payload: validatedCart });
                    } catch (error) {
                        console.error('Error loading cart after user change:', error);
                        dispatch({ type: 'CLEAR_CART' });
                    }
                } else {
                    dispatch({ type: 'CLEAR_CART' });
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [getCartStorageKey]); // Include getCartStorageKey dependency

    // Cart methods
    const addToCart = useCallback((item: Omit<CartItem, 'id'>) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) || 0 : (item.price || 0);
        const originalPrice = typeof item.originalPrice === 'string'
            ? parseFloat(item.originalPrice) || price
            : (item.originalPrice ?? price);
        const quantity = typeof item.quantity === 'string' ? parseInt(item.quantity) || 1 : (item.quantity || 1);

        const sanitizedItem: Omit<CartItem, 'id'> = {
            ...item,
            price,
            originalPrice,
            quantity,
        };

        dispatch({ type: 'ADD_ITEM', payload: sanitizedItem });
    }, []);

    const removeFromCart = useCallback((itemId: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    }, []);

    const updateQuantity = useCallback((itemId: string, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
    }, []);

    const clearCart = useCallback(() => {
        dispatch({ type: 'CLEAR_CART' });
    }, []);

    const getCartTotal = useCallback((): number => {
        const total = cart?.totalAmount || 0;
        return isNaN(total) ? 0 : total;
    }, [cart?.totalAmount]);

    const getCartOriginalTotal = useCallback((): number => {
        if (!cart || !cart.items.length) return 0;
        const totals = calculateCartTotals(cart.items);
        const originalTotal = totals.originalTotal || 0;
        return isNaN(originalTotal) ? 0 : originalTotal;
    }, [cart]);

    const getTotalSavings = useCallback((): number => {
        const savings = cart?.totalSavings || 0;
        return isNaN(savings) ? 0 : savings;
    }, [cart?.totalSavings]);

    const getCartItemCount = useCallback((): number => {
        if (!cart?.items) return 0;
        const count = cart.items.reduce((total, item) => {
            const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 0;
            return total + quantity;
        }, 0);
        return isNaN(count) ? 0 : count;
    }, [cart?.items]);

    const loadUserCart = useCallback(async (userId?: string) => {
        try {
            const response = await fetch(`/api/cart/${userId}`);
            if (response.ok) {
                const cartData = await response.json();
                const validatedCart: Cart = {
                    ...createEmptyCart(),
                    ...cartData,
                    appliedPromoCodes: cartData.appliedPromoCodes || []
                };
                dispatch({ type: 'SET_CART', payload: validatedCart });
            }
        } catch (error) {
            console.error('Error loading user cart:', error);
        }
    }, []);

    const applyPromoCode = useCallback(async (promoCode: string): Promise<boolean> => {
        try {
            const response = await fetch('/api/promo/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ promoCode, cartItems: cart?.items })
            });

            if (response.ok) {
                const { updatedItems } = await response.json();
                dispatch({ type: 'APPLY_PROMO_CODE', payload: { promoCode, items: updatedItems } });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error applying promo code:', error);
            return false;
        }
    }, [cart?.items]);

    const removePromoCode = useCallback((promoCode: string) => {
        dispatch({ type: 'REMOVE_PROMO_CODE', payload: promoCode });
    }, []);

    const value: CartContextType = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartOriginalTotal,
        getTotalSavings,
        getCartItemCount,
        loadUserCart,
        applyPromoCode,
        removePromoCode
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook to use cart context
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
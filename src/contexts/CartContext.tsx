'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Cart, CartItem, CartContextType } from '@/types/cart';

interface CartState {
    cart: Cart | null;
}

type CartAction =
    | { type: 'SET_CART'; payload: Cart }
    | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'id'> }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
    | { type: 'CLEAR_CART' };

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'SET_CART':
            return { cart: action.payload };

        case 'ADD_ITEM':
            if (!state.cart) {
                const newCart: Cart = {
                    id: 'temp-cart',
                    userId: 'current-user',
                    items: [{
                        id: Date.now().toString(),
                        ...action.payload
                    }],
                    totalAmount: action.payload.price * action.payload.quantity,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                return { cart: newCart };
            }

            // For rental items, check uniqueness by game + rental days
            // For purchase items, check by productId only
            const existingItemIndex = state.cart.items.findIndex(item => {
                if (action.payload.type === 'rental') {
                    return item.productId === action.payload.productId && 
                           item.type === 'rental' && 
                           item.rentalDays === action.payload.rentalDays;
                } else {
                    return item.productId === action.payload.productId && item.type !== 'rental';
                }
            });

            let updatedItems: CartItem[];
            if (existingItemIndex >= 0) {
                // For rental items, don't increase quantity, just replace
                if (action.payload.type === 'rental') {
                    updatedItems = state.cart.items.map((item, index) =>
                        index === existingItemIndex ? { ...item, ...action.payload, id: item.id } : item
                    );
                } else {
                    // For purchase items, increase quantity
                    updatedItems = state.cart.items.map((item, index) =>
                        index === existingItemIndex
                            ? { ...item, quantity: item.quantity + action.payload.quantity }
                            : item
                    );
                }
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
                cart: {
                    ...state.cart,
                    items: updatedQuantityItems,
                    totalAmount: updatedTotal,
                    updatedAt: new Date()
                }
            };

        case 'CLEAR_CART':
            return { cart: null };

        default:
            return state;
    }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, { cart: null });

    useEffect(() => {
        // Load cart from localStorage on mount
        const savedCart = localStorage.getItem('customer-cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                dispatch({ type: 'SET_CART', payload: parsedCart });
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
            }
        }
    }, []);

    useEffect(() => {
        // Save cart to localStorage whenever it changes
        if (state.cart) {
            localStorage.setItem('customer-cart', JSON.stringify(state.cart));
        } else {
            localStorage.removeItem('customer-cart');
        }
    }, [state.cart]);

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
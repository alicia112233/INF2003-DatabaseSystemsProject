export interface CartItem {
    id: string;
    productId: string;
    title: string;
    price: number;
    quantity: number;
    image_url?: string;
    description?: string;
}

export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CartContextType {
    cart: Cart | null;
    addToCart: (item: Omit<CartItem, 'id'>) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getCartItemCount: () => number;
}

export interface Product {
    id: string;
    title: string;
    price: number;
    image_url?: string;
    description?: string;
    genres?: number[];
    genreNames: string[];
    inStock?: boolean;
}
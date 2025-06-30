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
    loadUserCart?: (userId?: string) => Promise<void>;
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

export type PriceRange = {
    min: number;
    max: number;
};

// Game interface (assuming this is what your game objects look like)
export interface Game {
    id: string;
    title: string;
    price: number;
    image_url?: string;
    description?: string;
    genres?: number[];
    genreNames?: string[];
    inStock?: boolean;
    // Add other game-specific properties as needed
}

// Helper function to convert Game to Product
export const gameToProduct = (game: Game): Product => {
    return {
        id: game.id,
        title: game.title,
        price: game.price,
        image_url: game.image_url,
        description: game.description,
        genres: game.genres,
        genreNames: game.genreNames || [],
        inStock: game.inStock
    };
};

// Helper function to convert Product to CartItem
export const productToCartItem = (product: Product, quantity: number = 1): Omit<CartItem, 'id'> => {
    return {
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: quantity,
        image_url: product.image_url,
        description: product.description
    };
};
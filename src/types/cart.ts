import { Promotion } from "./promotion";

export interface CartItem {
    id: string;
    productId: string;
    title: string;
    price: number;
    originalPrice?: number; // Add original price before discount
    quantity: number;
    image_url?: string;
    description?: string;
    type?: 'purchase' | 'rental';
    rentalDays?: number;
    dailyRate?: number;
    promo_code?: string; // Add promo code to cart item
    promotion?: {
        discountValue: number;
        discountType: 'percentage' | 'fixed';
    };
}

export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
    totalAmount: number;
    totalSavings?: number; // Add total savings from promotions
    appliedPromoCodes?: string[]; // Track applied promo codes
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
    getCartOriginalTotal: () => number;
    getTotalSavings: () => number;
    getCartItemCount: () => number;
    loadUserCart?: (userId?: string) => Promise<void>;
    applyPromoCode?: (promoCode: string) => Promise<boolean>;
    removePromoCode?: (promoCode: string) => void;
}

export interface Product {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    image_url?: string;
    description?: string;
    genres?: number[];
    genreNames: string[];
    inStock?: boolean;
    stockCount?: number; // for product availability
    promo_code?: string;
    promotion?: {
        discountValue: number;
        discountType: 'percentage' | 'fixed';
    };
}

export type PriceRange = {
    min: number;
    max: number;
};

// Game interface
export interface Game {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    image_url?: string;
    description?: string;
    genres?: number[];
    genreNames?: string[];
    stockCount?: number; // for product availability
    inStock?: boolean;
    promo_code?: string;
    promotion?: Promotion | null;
}

// Helper function to convert Game to Product
export const gameToProduct = (game: Game, promotion: Promotion | null = null): Product => {
    const gamePromotion = promotion || game.promotion;
    const originalPrice = game.originalPrice || game.price;
    const discountedPrice = gamePromotion ? calculateDiscountedPrice(originalPrice, {
        discountValue: gamePromotion.discountValue,
        discountType: gamePromotion.discountType
    }) : originalPrice;

    return {
        id: game.id,
        title: game.title,
        price: discountedPrice,
        originalPrice: originalPrice,
        image_url: game.image_url,
        description: game.description,
        genres: game.genres,
        genreNames: game.genreNames || [],
        inStock: game.inStock,
        promo_code: game.promo_code,
        promotion: gamePromotion ? {
            discountValue: gamePromotion.discountValue,
            discountType: gamePromotion.discountType
        } : undefined
    };
};

// Helper function to calculate discounted price
export const calculateDiscountedPrice = (
  originalPrice: number,
  promotion?: { discountValue: number; discountType: 'percentage' | 'fixed' }
): number => {
  if (!promotion) return originalPrice;

  const { discountType, discountValue } = promotion;
  const value = Number(discountValue);
  if (isNaN(value) || value < 0) return originalPrice;

  if (discountType === 'percentage') {
    return Math.max(originalPrice - (originalPrice * value) / 100, 0);
  }

  return Math.max(originalPrice - value, 0);
};

// Helper function to convert Product to CartItem
export const productToCartItem = (
  product: Product,
  promotion: Promotion | null = null,
  quantity: number = 1,
  type: 'purchase' | 'rental' = 'purchase'
): Omit<CartItem, 'id'> => {
  const gamePromotion = promotion || product.promotion;
  const originalPrice = Number(product.originalPrice ?? product.price);
  if (isNaN(originalPrice) || originalPrice < 0) {
    throw new Error('Invalid original price');
  }
  const discountedPrice = gamePromotion
    ? calculateDiscountedPrice(originalPrice, {
        discountValue: gamePromotion.discountValue,
        discountType: gamePromotion.discountType,
      })
    : originalPrice;
  return {
    productId: product.id,
    title: product.title,
    price: discountedPrice,
    originalPrice: originalPrice,
    quantity: quantity,
    image_url: product.image_url,
    description: product.description,
    type: type,
    promo_code: product.promo_code,
    promotion: gamePromotion
      ? {
          discountValue: gamePromotion.discountValue,
          discountType: gamePromotion.discountType,
        }
      : undefined,
  };
};

// Helper function to calculate cart totals
export const calculateCartTotals = (items: CartItem[]) => {
    const originalTotal = items.reduce((sum, item) => {
        const originalPrice = item.originalPrice || item.price;
        return sum + (originalPrice * item.quantity);
    }, 0);
    
    const discountedTotal = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
    
    const totalSavings = originalTotal - discountedTotal;
    
    return {
        originalTotal,
        discountedTotal,
        totalSavings
    };
};

// Helper function to get unique promo codes from cart
export const getAppliedPromoCodes = (items: CartItem[]): string[] => {
    const promoCodes = items
        .filter(item => item.promo_code)
        .map(item => item.promo_code!)
        .filter((code, index, array) => array.indexOf(code) === index); // Remove duplicates
    
    return promoCodes;
};
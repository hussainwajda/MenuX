// src/store/useCartStore.ts
import { create } from 'zustand';

// Define what a "Cart Item" looks like
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
  instruction?: string;
  is_veg: boolean; 
}

// Define the actions available in the store
interface CartStore {
  items: CartItem[];
  
  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  updateInstruction: (id: string, instruction: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],

  // Add item to cart
  addItem: (newItem) => set((state) => {
    // Check if item already exists to just increase quantity
    const existingItem = state.items.find(item => item.id === newItem.id);
    
    if (existingItem) {
      return {
        items: state.items.map(item => 
          item.id === newItem.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      };
    }
    
    // Otherwise add as new item
    return { items: [...state.items, { ...newItem, quantity: 1 }] };
  }),

  // Remove item completely
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id),
  })),

  // Increase quantity (+)
  increaseQuantity: (id) => set((state) => ({
    items: state.items.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ),
  })),

  // Decrease quantity (-)
  decreaseQuantity: (id) => set((state) => ({
    items: state.items.map((item) => {
      if (item.id === id && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    }).filter((item) => item.quantity > 0) // Remove if quantity becomes 0
  })),

  updateInstruction: (id, instruction) => set((state) => ({
    items: state.items.map((item) =>
      item.id === id ? { ...item, instruction } : item
    ),
  })),

  // Clear all
  clearCart: () => set({ items: [] }),
}));

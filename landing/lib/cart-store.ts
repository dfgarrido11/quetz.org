import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CartItemType = 'one-time' | 'subscription';

export interface SpeciesSelection {
  species: string;
  name: string;
  quantity: number;
}

export interface CartItem {
  id: string;
  type: CartItemType;
  // For one-time purchases
  treeId?: string;
  treeName?: string;
  treeImage?: string;
  // For subscriptions
  planId?: string;
  planName?: string;
  treesPerMonth?: number;
  speciesSelection?: SpeciesSelection[];
  // Common
  quantity: number;
  pricePerUnit: number;
  isGift: boolean;
  giftRecipient?: {
    name: string;
    email: string;
    message?: string;
  };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateGiftStatus: (id: string, isGift: boolean) => void;
  updateGiftRecipient: (id: string, recipient: CartItem['giftRecipient']) => void;
  updateSpeciesSelection: (id: string, selection: SpeciesSelection[]) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  
  // Computed
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemsByType: () => { forMe: CartItem[]; gifts: CartItem[] };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (item) => {
        const id = `${item.treeId || item.planId || 'item'}-${item.isGift ? 'gift' : 'me'}-${Date.now()}`;
        set((state) => ({
          items: [...state.items, { ...item, id }],
        }));
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },
      
      updateGiftStatus: (id, isGift) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, isGift, giftRecipient: isGift ? item.giftRecipient : undefined }
              : item
          ),
        }));
      },
      
      updateGiftRecipient: (id, recipient) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, giftRecipient: recipient } : item
          ),
        }));
      },
      
      updateSpeciesSelection: (id, selection) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, speciesSelection: selection } : item
          ),
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      setCartOpen: (open) => set({ isOpen: open }),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.pricePerUnit * item.quantity,
          0
        );
      },
      
      getItemsByType: () => {
        const items = get().items;
        return {
          forMe: items.filter((item) => !item.isGift),
          gifts: items.filter((item) => item.isGift),
        };
      },
    }),
    {
      name: 'quetz-cart',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') return sessionStorage;
        return localStorage;
      }),
    }
  )
);

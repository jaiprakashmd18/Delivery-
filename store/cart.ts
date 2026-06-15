import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  couponCode: string | null;
  couponDiscount: number;
  deliveryAddressId: string | null;

  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setCoupon: (code: string, discount: number) => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  setDeliveryAddress: (addressId: string) => void;

  getSubtotal: () => number;
  getItemCount: () => number;
  getDeliveryFee: () => number;
  getTax: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,
      couponCode: null,
      couponDiscount: 0,
      deliveryAddressId: null,

      addItem: (item: CartItem) => {
        const state = get();

        // If adding from different restaurant, clear cart first
        if (state.restaurantId && state.restaurantId !== item.restaurantId) {
          set({
            items: [item],
            restaurantId: item.restaurantId,
            restaurantName: item.restaurantName,
            couponCode: null,
            couponDiscount: 0,
          });
          return;
        }

        const existingItem = state.items.find(i => i.menuItemId === item.menuItemId);

        if (existingItem) {
          set({
            items: state.items.map(i =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({
            items: [...state.items, item],
            restaurantId: item.restaurantId,
            restaurantName: item.restaurantName,
          });
        }
      },

      removeItem: (itemId: string) => {
        const state = get();
        const newItems = state.items.filter(i => i.id !== itemId);
        set({
          items: newItems,
          restaurantId: newItems.length === 0 ? null : state.restaurantId,
          restaurantName: newItems.length === 0 ? null : state.restaurantName,
        });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map(i =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({
        items: [],
        restaurantId: null,
        restaurantName: null,
        couponCode: null,
        couponDiscount: 0,
        deliveryAddressId: null,
      }),

      setCoupon: (code: string, discount: number) => set({
        couponCode: code,
        couponDiscount: discount,
      }),

      applyCoupon: (code: string, discount: number) => set({
        couponCode: code,
        couponDiscount: discount,
      }),

      removeCoupon: () => set({
        couponCode: null,
        couponDiscount: 0,
      }),

      setDeliveryAddress: (addressId: string) => set({
        deliveryAddressId: addressId,
      }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getDeliveryFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal >= 30 ? 0 : 3; // Free delivery over 30 GEL
      },

      getTax: () => {
        return get().getSubtotal() * 0.18; // 18% VAT
      },

      getTotal: () => {
        const state = get();
        return state.getSubtotal() + state.getDeliveryFee() + state.getTax() - state.couponDiscount;
      },
    }),
    {
      name: 'student-express-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

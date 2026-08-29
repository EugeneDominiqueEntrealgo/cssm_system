import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const getCartKey = (userId) => `storehub-cart-${userId || 'guest'}`;

const readCart = (userId) => {
  try {
    const saved = localStorage.getItem(getCartKey(userId));
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load cart:', error);
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [items, setItems] = useState(() => readCart(userId));

  useEffect(() => {
    setItems(readCart(userId));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    localStorage.setItem(getCartKey(userId), JSON.stringify(items));
  }, [items, userId]);

  const addToCart = (product) => {
    const stock = Number(product?.stock ?? product?.stock_quantity ?? 0);
    if (!product?.id || stock <= 0) {
      return { ok: false, message: 'This product is out of stock.' };
    }

    let result = { ok: true, message: `${product.name} added to cart.` };
    setItems((currentItems) => {
      const existing = currentItems.find((item) => item.id === product.id);
      if (existing && existing.quantity >= stock) {
        result = { ok: false, message: `Only ${stock} available for ${product.name}.` };
        return currentItems;
      }

      if (existing) {
        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, product, quantity: Math.min(item.quantity + 1, stock) }
            : item,
        );
      }

      return [...currentItems, { product, id: product.id, quantity: 1 }];
    });
    return result;
  };

  const updateQuantity = (productId, quantity) => {
    setItems((currentItems) => currentItems.flatMap((item) => {
      if (item.id !== productId) return [item];
      const stock = Number(item.product?.stock ?? item.product?.stock_quantity ?? 0);
      const nextQuantity = Math.max(0, Math.min(Number(quantity) || 0, stock));
      return nextQuantity > 0 ? [{ ...item, quantity: nextQuantity }] : [];
    }));
  };

  const removeFromCart = (productId) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== productId));
  };

  const clearCart = () => setItems([]);

  const value = useMemo(() => ({
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    total: items.reduce((total, item) => total + Number(item.product?.price || 0) * item.quantity, 0),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
};

export default CartContext;

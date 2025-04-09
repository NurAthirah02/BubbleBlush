// cartContext.js
import React, { createContext, useState, useEffect } from 'react';
import { getCart } from './cart';
import authService from './auth';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const refreshCart = async () => {
    try {
      const items = await getCart();
      const mappedItems = Array.isArray(items)
        ? items.map(item => ({ ...item, selected: false }))
        : [];
      setCartItems(mappedItems);
      console.log('CartProvider setCartItems:', mappedItems);
    } catch (error) {
      console.error('Error refreshing cart:', error);
      setCartItems([]);
    }
  };

  useEffect(() => {
    const checkAuthAndLoadCart = async () => {
      try {
        const user = await authService.getCurrentUser();
        setIsLoggedIn(!!user);
        if (user) {
          await refreshCart();
        } else {
          setCartItems([]);
          console.log('No user, cartItems reset to:', []);
        }
      } catch (error) {
        console.error('Error in checkAuthAndLoadCart:', error);
        setCartItems([]);
      }
    };
    checkAuthAndLoadCart();
  }, []);

  if (!children) {
    console.warn('CartProvider received no children');
    return null;
  }

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, refreshCart, isLoggedIn }}>
      {children}
    </CartContext.Provider>
  );
};
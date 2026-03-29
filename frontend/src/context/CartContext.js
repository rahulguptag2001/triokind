// context/CartContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);

  // Load cart and user from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem('cart');
      }
    }

    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser && savedUser !== 'undefined' && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    setCartItems(prevItems => {
      // FIX: use product.id to match so find/update works correctly
      const existingItem = prevItems.find(item => item.id === product.id);

      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }

      return [
        ...prevItems,
        {
          id: product.id,           // FIX: id is needed by Cart.js for key, removeFromCart, updateQuantity
          productId: product.id,    // kept for checkout payload
          name: product.name,
          price: parseFloat(product.price),
          quantity: qty,
          image_url: product.image_url,
          manufacturer: product.manufacturer,
        },
      ];
    });

    // Cart icon bounce animation
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
      cartBtn.classList.add('bounce');
      setTimeout(() => cartBtn.classList.remove('bounce'), 500);
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const getCartTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const getCartCount = () =>
    cartItems.reduce((count, item) => count + item.quantity, 0);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    clearCart();
  };

  const isAuthenticated = () => !!user && !!localStorage.getItem('token');

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    user,
    login,
    logout,
    isAuthenticated,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
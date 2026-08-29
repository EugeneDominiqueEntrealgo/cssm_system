import { useState, useEffect, useCallback } from 'react';

/**
 * Favorites/Wishlist management hook
 * Persists to localStorage
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('productFavorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('productFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = useCallback((productId) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const isFavorited = useCallback(
    (productId) => favorites.includes(productId),
    [favorites]
  );

  const addFavorite = useCallback((productId) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev : [...prev, productId]
    );
  }, []);

  const removeFavorite = useCallback((productId) => {
    setFavorites((prev) => prev.filter((id) => id !== productId));
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorited,
    addFavorite,
    removeFavorite,
    clearFavorites,
    favoriteCount: favorites.length,
  };
};

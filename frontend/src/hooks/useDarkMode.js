import { useState, useEffect } from 'react';

/**
 * Dark mode management hook
 * Persists preference to localStorage
 */
export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }

    // Check system preference
    return (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggle = () => setIsDarkMode(!isDarkMode);

  return { isDarkMode, toggle, setIsDarkMode };
};

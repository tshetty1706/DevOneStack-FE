import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark'; // Dark mode is default
  });

  useEffect(() => {
    const root = window.document.body;
    const docEl = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-mode');
      docEl.setAttribute('data-theme', 'light');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light-mode');
      docEl.setAttribute('data-theme', 'dark');
      root.setAttribute('data-theme', 'dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

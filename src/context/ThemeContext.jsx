import React, { createContext, useState, useEffect, useContext } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('devonestack-theme');
    return saved ? saved : 'dark';
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('devonestack-theme', next);
      return next;
    });
  };

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'light') {
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
      root.style.setProperty('color-scheme', 'light');
    } else {
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
      root.style.setProperty('color-scheme', 'dark');
    }
  }, [theme]);

  // Ant Design custom theme tokens
  const customTheme = {
    algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: theme === 'dark' ? '#6366f1' : '#4f46e5',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      borderRadius: 8,
      colorBgContainer: theme === 'dark' ? 'rgba(20, 20, 25, 0.6)' : 'rgba(255, 255, 255, 0.8)',
      colorBorderSecondary: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)',
    },
    components: {
      Button: {
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontWeight: 500,
      },
      Card: {
        colorBgContainer: theme === 'dark' ? 'rgba(20, 20, 25, 0.6)' : 'rgba(255, 255, 255, 0.8)',
        colorBorderSecondary: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)',
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ConfigProvider theme={customTheme}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;

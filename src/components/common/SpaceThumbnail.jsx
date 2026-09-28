import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { resolveThumbnail, getDefaultThumbnail } from '../../constants/tools';

/**
  * SpaceThumbnail - Centralized reusable component for rendering Space thumbnails
  * Handles:
  * - Predefined tool thumbnails (theme-aware switching between lightMode and darkMode)
  * - Custom Cloudinary / uploaded thumbnails (persists across theme changes)
  * - Aspect ratio preservation and containment/cover
  * - Fallback error handling (broken URL gracefully falls back to default thumbnail)
  * - Smooth visual transitions and hover effects
  */
export default function SpaceThumbnail({
  thumbnail,
  tool,
  name,
  theme: explicitTheme,
  alt,
  className = '',
  style = {},
  imgStyle = {},
  objectFit = 'cover',
  objectPosition = 'center',
  aspectRatio = '16 / 9',
  fallback,
  onLoad,
  onError,
  isHovered = false,
  interactive = false,
}) {
  const themeContext = useTheme();
  const currentTheme = explicitTheme || themeContext?.theme || 'dark';
  const isLight = currentTheme === 'light';

  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset error state if thumbnail, theme, tool, or name changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [thumbnail, currentTheme, tool, name]);

  const targetThumbnail = resolveThumbnail(thumbnail || tool || name, currentTheme);
  const defaultFallback = getDefaultThumbnail(currentTheme);
  const rawSrc = hasError ? (fallback || defaultFallback) : (targetThumbnail || fallback || defaultFallback);
  // Auto-optimize Cloudinary delivery URLs with format & quality auto
  const finalSrc = typeof rawSrc === 'string' && rawSrc.includes('res.cloudinary.com') && rawSrc.includes('/upload/') && !rawSrc.includes('/f_auto')
    ? rawSrc.replace('/upload/', '/upload/f_auto,q_auto,w_800,c_limit/')
    : rawSrc;

  const handleError = (e) => {
    if (!hasError) {
      setHasError(true);
      if (onError) onError(e);
    }
  };

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  return (
    <div
      className={`space-thumbnail-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: aspectRatio || undefined,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isLight ? '#f1f5f9' : '#07070b',
        ...style,
      }}
    >
      <img
        src={finalSrc}
        alt={alt || `${name || tool || 'Space'} thumbnail`}
        loading="lazy"
        decoding="async"
        onError={handleError}
        onLoad={handleLoad}
        style={{
          width: '100%',
          height: '100%',
          objectFit: objectFit,
          objectPosition: objectPosition,
          display: 'block',
          transition: 'transform 0.35s ease, opacity 0.25s ease',
          transform: interactive && isHovered ? 'scale(1.03)' : 'scale(1)',
          opacity: isLoaded || hasError ? 1 : 0.85,
          ...imgStyle,
        }}
      />
    </div>
  );
}

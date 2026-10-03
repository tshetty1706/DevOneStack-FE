// Centralized Thumbnail Configuration for DevOneStack
// Only supports DevOneStack default theme thumbnails & user custom uploaded images from device

import defaultDarkThumbnail from '../assets/thumbnail/default_dark.png';
import defaultLightThumbnail from '../assets/thumbnail/default_light.png';

export const DEFAULT_THUMBNAILS = {
  light: defaultLightThumbnail || '/thumbnail/default_light.png',
  dark: defaultDarkThumbnail || '/thumbnail/default_dark.png',
};

/**
 * Get theme-aware default thumbnail
 */
export function getDefaultThumbnail(theme = 'dark') {
  if (theme === 'light') {
    return DEFAULT_THUMBNAILS.light;
  }
  return DEFAULT_THUMBNAILS.dark;
}

/**
 * Check if a thumbnail string is a custom uploaded file (Cloudinary, blob, or data URI)
 */
export function isCustomUploadedThumbnail(thumbnail) {
  if (!thumbnail || typeof thumbnail !== 'string') return false;
  const trimmed = thumbnail.trim();
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  );
}

/**
 * Resolve the thumbnail path: Only returns custom uploaded images or the default theme thumbnail.
 * Automatic tool-name or space-name based thumbnail resolution is completely removed.
 */
export function resolveThumbnail(toolOrThumb, theme = 'dark') {
  if (typeof toolOrThumb === 'string' && isCustomUploadedThumbnail(toolOrThumb)) {
    return toolOrThumb.trim();
  }
  return getDefaultThumbnail(theme);
}

/**
 * Get thumbnail for space: Alias to resolveThumbnail
 */
export function getToolThumbnail(toolOrThumb, theme = 'dark') {
  return resolveThumbnail(toolOrThumb, theme);
}

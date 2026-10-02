/**
 * Centralized Universal File Resolver for DevOneStack
 * Provides uniform file inspection, URL generation, and download handlers across all modules.
 */

const SERVER_ORIGIN = import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_API_URL || 'http://localhost:9000';

export function isPdfFile(item) {
  if (!item) return false;
  const docType = (item.docType || item.type || '').toLowerCase();
  const format = (item.format || '').toLowerCase();
  const title = (item.title || item.name || '').toLowerCase();
  const cUrl = (item.cloudinaryUrl || '').toLowerCase();
  const cId = (item.cloudinaryPublicId || '').toLowerCase();
  const url = (item.url || '').toLowerCase();

  return (
    docType === 'pdf' ||
    format === 'pdf' ||
    title.endsWith('.pdf') ||
    cUrl.includes('.pdf') ||
    cId.includes('.pdf') ||
    url.includes('.pdf')
  );
}

export function isImageFile(item) {
  if (!item) return false;
  if (isPdfFile(item)) return false;
  const docType = (item.docType || item.type || '').toLowerCase();
  const format = (item.format || '').toLowerCase();
  const title = (item.title || item.name || '').toLowerCase();
  const cUrl = (item.cloudinaryUrl || '').toLowerCase();
  const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];

  return (
    docType === 'image' ||
    imageFormats.includes(format) ||
    /\.(jpe?g|png|webp|gif|svg|bmp|ico)$/i.test(title) ||
    /\.(jpe?g|png|webp|gif|svg|bmp|ico)/i.test(cUrl)
  );
}

export function isUrlResource(item) {
  if (!item) return false;
  const docType = (item.docType || item.type || '').toLowerCase();
  return (
    docType === 'url' ||
    docType === 'link' ||
    (!isPdfFile(item) && !isImageFile(item) && Boolean(item.url) && !item.cloudinaryUrl)
  );
}

/**
 * Returns the reliable, canonical URL to view or stream the file
 */
export function resolveFileUrl(item, spaceId) {
  if (!item) return '';

  // Web links
  if (isUrlResource(item) && item.url) {
    return item.url;
  }

  const sId = (spaceId?._id || spaceId) || (item.spaceId?._id || item.spaceId);

  // PDFs: Always stream via the backend proxy to avoid 401 Unauthorized from Cloudinary and provide inline headers
  if (isPdfFile(item)) {
    return `${SERVER_ORIGIN}/api/spaces/${sId}/items/${item._id}/file`;
  }

  // Images: Load directly from Cloudinary CDN for performance
  if (isImageFile(item) && item.cloudinaryUrl) {
    return item.cloudinaryUrl;
  }

  // Other uploaded binary files: Stream via backend proxy
  if (item.cloudinaryUrl) {
    return `${SERVER_ORIGIN}/api/spaces/${sId}/items/${item._id}/file`;
  }

  if (item.url) {
    return item.url;
  }

  return `${SERVER_ORIGIN}/api/spaces/${sId}/items/${item._id}/file`;
}

/**
 * Formats byte size into human readable string (KB, MB)
 */
export function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

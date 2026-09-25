/**
 * Utility functions for URL parsing and domain extraction
 */

export function getDomain(urlStr) {
  if (!urlStr) return 'docs';
  try {
    const url = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    return url.hostname.replace('www.', '');
  } catch {
    return 'docs';
  }
}

export function isValidUrl(urlStr) {
  if (!urlStr) return false;
  try {
    new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
    return true;
  } catch {
    return false;
  }
}

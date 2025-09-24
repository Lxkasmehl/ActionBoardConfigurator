/**
 * Utility functions for handling config URLs
 */

/**
 * Generate a URL with a config parameter
 * @param {string} configId - The config ID to add to the URL
 * @param {string} baseUrl - Optional base URL (defaults to current location)
 * @returns {string} - The URL with config parameter
 */
export const generateConfigUrl = (
  configId,
  baseUrl = window.location.origin + window.location.pathname
) => {
  const url = new URL(baseUrl);
  url.searchParams.set('config', configId);
  return url.toString();
};

/**
 * Get the current config ID from URL parameters
 * @returns {string|null} - The config ID from URL or null if not present
 */
export const getConfigIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('config');
};

/**
 * Update the current URL with a config parameter
 * @param {string} configId - The config ID to set
 */
export const updateUrlWithConfig = (configId) => {
  const url = new URL(window.location);
  if (configId) {
    url.searchParams.set('config', configId);
  } else {
    url.searchParams.delete('config');
  }
  window.history.pushState({}, '', url);
};

/**
 * Remove config parameter from URL
 */
export const clearConfigFromUrl = () => {
  updateUrlWithConfig(null);
};

/**
 * Check if a config ID is valid (basic validation)
 * @param {string} configId - The config ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidConfigId = (configId) => {
  if (!configId || typeof configId !== 'string') return false;
  // Basic validation: should not be empty and should not contain spaces
  return configId.trim().length > 0 && !configId.includes(' ');
};

/**
 * Clean URL by removing invalid config parameters
 */
export const cleanInvalidConfigFromUrl = () => {
  const configId = getConfigIdFromUrl();
  if (configId && !isValidConfigId(configId)) {
    clearConfigFromUrl();
  }
};

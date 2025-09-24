/**
 * @fileoverview Network request handling and URL encoding utilities
 * This module provides functions for managing network requests and URL encoding
 */

/**
 * Maximum number of parallel requests allowed
 * @constant {number}
 */
const MAX_PARALLEL_REQUESTS = 10;

/**
 * Request management utilities
 */
export const requestManager = {
  /**
   * Current number of active requests
   * @type {number}
   */
  currentRequests: 0,

  /**
   * Waits for an available slot to make a new request
   * @returns {Promise<void>} Promise that resolves when a slot is available
   */
  waitForOpenSlot: function () {
    return new Promise((resolve) => {
      const check = () => {
        if (this.currentRequests < MAX_PARALLEL_REQUESTS) {
          this.currentRequests++;
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  },

  /**
   * Releases a request slot
   */
  releaseSlot: function () {
    this.currentRequests--;
  },

  /**
   * Resets the request counter
   */
  reset: function () {
    this.currentRequests = 0;
  },
};

/**
 * URL encoding utilities
 */
export const urlUtils = {
  /**
   * Encodes a URI component with additional characters encoded
   * @param {string} str - The string to encode
   * @returns {string} The encoded string
   */
  fixedEncodeURIComponent: (str) => {
    return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
  },

  /**
   * Builds a query string from an object
   * @param {Object} params - The parameters object
   * @returns {string} The query string
   */
  buildQueryString: (params) => {
    if (!params) return '';

    return Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => {
        const encodedKey = urlUtils.fixedEncodeURIComponent(key);
        const encodedValue = urlUtils.fixedEncodeURIComponent(value);
        return `${encodedKey}=${encodedValue}`;
      })
      .join('&');
  },

  /**
   * Combines a base URL with query parameters
   * @param {string} baseUrl - The base URL
   * @param {Object} params - The query parameters
   * @returns {string} The complete URL
   */
  buildUrl: (baseUrl, params) => {
    if (!params) return baseUrl;

    const queryString = urlUtils.buildQueryString(params);
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  },
};

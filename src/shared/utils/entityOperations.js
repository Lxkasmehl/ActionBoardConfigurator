/**
 * @fileoverview Core entity operations and utilities for handling entity data
 * This module provides functions for sorting, filtering, and type handling of entities
 */

/**
 * Sorts entities by their label or name
 * @param {Array} entities - Array of entity objects
 * @returns {Array} Sorted array of entities
 */
export const sortEntities = (entities) => {
  if (!entities || !Array.isArray(entities)) {
    return [];
  }
  return [...entities].sort((a, b) => {
    const labelA = (a.name || '').toLowerCase();
    const labelB = (b.name || '').toLowerCase();
    return labelA.localeCompare(labelB);
  });
};

/**
 * Sorts entity properties by their name
 * @param {Array} properties - Array of property objects
 * @returns {Array} Sorted array of properties
 */
export const sortProperties = (properties) => {
  return [...properties].sort((a, b) => {
    const labelA = (a.Name || '').toLowerCase();
    const labelB = (b.Name || '').toLowerCase();
    return labelA.localeCompare(labelB);
  });
};

/**
 * Removes duplicate properties based on their name
 * @param {Array} properties - Array of property objects
 * @returns {Array} Array with unique properties
 */
export const filterUniqueProperties = (properties) => {
  return properties.filter(
    (value, index, self) =>
      index === self.findIndex((t) => t.Name === value.Name),
  );
};

/**
 * Type handling utilities
 */
export const typeUtils = {
  /**
   * Extracts the base type from an Edm type string
   * @param {string} propertyType - The Edm type or other type string
   * @returns {string} The base type (e.g., 'string', 'date', 'number', etc.)
   */
  getBaseType: (propertyType) => {
    if (!propertyType) return 'string';

    const typeMatch = propertyType.match(/Edm\.(.*)/);
    const type = (typeMatch ? typeMatch[1] : propertyType).toLowerCase();

    switch (type) {
      case 'datetimeoffset':
      case 'date':
      case 'time':
        return 'date';

      case 'int16':
      case 'int32':
      case 'int64':
      case 'decimal':
      case 'double':
      case 'single':
        return 'number';

      case 'boolean':
        return 'boolean';

      case 'guid':
        return 'guid';

      default:
        return 'string';
    }
  },

  /**
   * Converts a value to the appropriate format based on the property type
   * @param {any} value - The value to convert
   * @param {string} propertyType - The Edm type or other type string
   * @returns {any} The converted value in the appropriate format
   */
  convertValue: (value, propertyType) => {
    if (!value) return '';

    const stringValue = String(value);
    const baseType = typeUtils.getBaseType(propertyType);

    switch (baseType) {
      case 'date': {
        if (stringValue.startsWith('/Date(') && stringValue.endsWith(')/')) {
          const timestamp = stringValue.substring(6, stringValue.length - 2);
          const milliseconds = parseInt(timestamp.split('+')[0], 10);
          try {
            const date = new Date(milliseconds);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
          } catch (e) {
            return stringValue;
          }
        }
        return stringValue;
      }

      case 'number':
        try {
          return parseFloat(stringValue);
        } catch (e) {
          return stringValue;
        }

      case 'boolean':
        return stringValue === 'true';

      default:
        return stringValue;
    }
  },

  /**
   * Determines if a value matches the expected property type
   * @param {any} value - The value to check
   * @param {string} propertyType - The Edm type or other type string
   * @returns {boolean} Whether the value matches the expected type
   */
  valueMatchesType: (value, propertyType) => {
    if (!propertyType || !value) return true;

    const baseType = typeUtils.getBaseType(propertyType);
    const stringValue = String(value);

    switch (baseType) {
      case 'date':
        return stringValue.startsWith('/Date(') && stringValue.endsWith(')/');

      case 'number':
        return !isNaN(parseFloat(stringValue)) && isFinite(stringValue);

      case 'boolean':
        return stringValue === 'true' || stringValue === 'false';

      case 'guid':
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          stringValue,
        );

      default:
        return true;
    }
  },

  /**
   * Formats a value based on its property type for display
   * @param {any} value - The value to format
   * @param {string} propertyType - The Edm type or other type string
   * @returns {string} The formatted value
   */
  formatValue: (value, propertyType) => {
    if (!value) return '';

    const stringValue = String(value);
    const baseType = typeUtils.getBaseType(propertyType);

    switch (baseType) {
      case 'date':
        if (stringValue.startsWith('/Date(') && stringValue.endsWith(')/')) {
          const timestamp = stringValue.substring(6, stringValue.length - 2);
          const milliseconds = parseInt(timestamp.split('+')[0], 10);
          try {
            return new Date(milliseconds).toLocaleString();
          } catch (e) {
            return stringValue;
          }
        }
        return stringValue;

      case 'boolean':
        return stringValue === 'true' ? 'True' : 'False';

      case 'number':
        try {
          return parseFloat(stringValue).toLocaleString();
        } catch (e) {
          return stringValue;
        }

      default:
        return stringValue;
    }
  },
};

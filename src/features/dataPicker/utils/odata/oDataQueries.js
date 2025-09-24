/**
 * @fileoverview OData query utilities and result formatting
 * This module provides functions for handling OData queries, filters, and result formatting
 */

/**
 * Query building utilities
 */
export const queryUtils = {
  /**
   * Converts a filter object to OData filter syntax
   * @param {Object} filter - The filter object containing conditions
   * @returns {string} The OData filter string
   */
  convertFilterToOData: (filter) => {
    if (!filter || !filter.conditions || filter.conditions.length === 0) {
      return '';
    }

    const processCondition = (condition) => {
      if (condition.conditions) {
        const nestedConditions = condition.conditions.map(processCondition);
        return `(${nestedConditions.join(` ${condition.entityLogic?.toLowerCase() || 'and'} `)})`;
      }

      let values;
      const value = condition.value?.toString() || '';
      const fieldName = condition.field;

      switch (condition.operator) {
        case 'eq':
          return `${fieldName} eq '${value}'`;
        case 'ne':
          return `${fieldName} ne '${value}'`;
        case 'gt':
          return `${fieldName} gt '${value}'`;
        case 'lt':
          return `${fieldName} lt '${value}'`;
        case 'le':
          return `${fieldName} le '${value}'`;
        case 'ge':
          return `${fieldName} ge '${value}'`;
        case 'LIKE':
          return `${fieldName} like '${value}'`;
        case 'IN':
          values = Array.isArray(condition.value)
            ? condition.value
            : value.split(',');
          return `(${values.map((v) => `${fieldName} eq '${v.trim()}'`).join(' or ')})`;
        default:
          return `${fieldName} eq '${value}'`;
      }
    };

    return processCondition(filter);
  },

  /**
   * Generates the expand parameter for OData queries
   * @param {Array} selectedProperties - Array of selected property paths
   * @param {string} entityName - Name of the current entity
   * @param {Array} allEntities - Array of all available entities
   * @returns {string} The expand parameter string
   */
  generateExpandParam: (selectedProperties, entityName, allEntities) => {
    let expandSet = new Set();

    selectedProperties.forEach((field) => {
      // Convert non-string values to strings
      const fieldStr = String(field);

      if (fieldStr.includes('/')) {
        const parts = fieldStr.split('/');
        expandSet.add(parts[0]);

        if (parts.length > 2) {
          for (let i = 1; i < parts.length - 1; i++) {
            expandSet.add(parts.slice(0, i + 1).join('/'));
          }
        }
      } else {
        const entity = allEntities.find((e) => e.name === entityName);
        const navigationProperty =
          entity?.properties?.navigationProperties?.find(
            (p) => p.Name === fieldStr,
          );
        if (navigationProperty) {
          expandSet.add(navigationProperty.Name);
        }
      }
    });

    const filteredExpands = [...expandSet].filter(
      (path) =>
        ![...expandSet].some(
          (otherPath) => path !== otherPath && otherPath.startsWith(path + '/'),
        ),
    );

    return filteredExpands.length > 0 ? filteredExpands.join(',') : '';
  },
};

/**
 * Result formatting utilities
 */
export const formatUtils = {
  /**
   * Parses OData date strings into formatted dates
   * @param {string} dateString - The OData date string
   * @returns {string} The formatted date string
   */
  parseODataDate: (dateString) => {
    if (!dateString || typeof dateString !== 'string') return dateString;

    const matchWithOffset = dateString.match(/\/Date\((-?\d+)([+-]\d{4})\)\//);
    if (matchWithOffset) {
      const timestamp = parseInt(matchWithOffset[1], 10);
      const date = new Date(timestamp);
      return formatUtils.formatDate(date);
    }

    const matchSimple = dateString.match(/\/Date\((-?\d+)\)\//);
    if (matchSimple) {
      const timestamp = parseInt(matchSimple[1], 10);
      const date = new Date(timestamp);
      return formatUtils.formatDate(date);
    }

    return dateString;
  },

  /**
   * Formats a date object according to German locale
   * @param {Date} date - The date object to format
   * @returns {string} The formatted date string
   */
  formatDate: (date) => {
    if (date.getHours() || date.getMinutes()) {
      return date.toLocaleString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  },

  /**
   * Cleans up an OData object by removing metadata and formatting dates
   * @param {Object} item - The OData object to clean up
   * @returns {Object} The cleaned up object
   */
  cleanupODataObject: (item) => {
    const cleanItem = {};

    for (const [key, value] of Object.entries(item)) {
      if (key === '__metadata' || key === 'metadata' || key.startsWith('__')) {
        continue;
      }

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        cleanItem[key] = formatUtils.cleanupODataObject(value);
      } else if (Array.isArray(value)) {
        cleanItem[key] = value.map((v) =>
          typeof v === 'object'
            ? formatUtils.cleanupODataObject(v)
            : formatUtils.parseODataDate(v),
        );
      } else {
        cleanItem[key] = formatUtils.parseODataDate(value);
      }
    }

    return cleanItem;
  },

  /**
   * Formats OData result data by cleaning up and formatting dates
   * @param {Object|Array} data - The OData result data
   * @returns {Object|Array} The formatted data
   */
  formatODataResult: (data) => {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map((item) => {
        const results = item.d?.results || item.results || item.d || item;
        return Array.isArray(results)
          ? results.map(formatUtils.cleanupODataObject)
          : formatUtils.cleanupODataObject(results);
      });
    }

    const results = data.d?.results || data.results || data.d || data;
    if (Array.isArray(results)) {
      return results.map(formatUtils.cleanupODataObject);
    }

    return formatUtils.cleanupODataObject(results);
  },
};

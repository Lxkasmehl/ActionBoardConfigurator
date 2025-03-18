/**
 * @fileoverview Navigation utilities for entity relationships and properties
 * This module provides functions for handling entity navigation and relationships
 */

/**
 * Finds a matching entity based on navigation property and association sets
 * @param {Object} params - The parameters object
 * @param {string} params.propertyName - Name of the navigation property
 * @param {Array} params.navigationProperties - Array of navigation properties
 * @param {Array} params.associationSets - Array of association sets
 * @param {Array} params.allEntities - Array of all available entities
 * @returns {Object|null} Object containing matching entity and property, or null if not found
 */
export function findMatchingEntity({
  propertyName,
  navigationProperties,
  associationSets,
  allEntities,
}) {
  const matchingProperty = navigationProperties.find(
    (np) => np.Name === propertyName,
  );

  if (!matchingProperty) return null;

  const relationship = matchingProperty.Relationship.startsWith('SFOData.')
    ? matchingProperty.Relationship.slice(8)
    : matchingProperty.Relationship;

  const matchingAssociationSet = associationSets.find(
    (as) => as.name === relationship,
  );

  if (!matchingAssociationSet) return null;

  const matchingEndElement = matchingAssociationSet.endElements.find(
    (ee) => ee.Role === matchingProperty.ToRole,
  );

  if (!matchingEndElement) return null;

  const matchingEntity = allEntities.find(
    (e) => e.name === matchingEndElement.EntitySet,
  );

  return {
    matchingEntity,
    matchingProperty,
  };
}

/**
 * Gets unique navigation properties for an entity
 * @param {Object} entity - The entity object
 * @returns {Array} Array of unique navigation properties
 */
export function getNavigationProperties(entity) {
  if (!entity) return [];

  return Array.from(
    new Set(entity.properties.navigationProperties.map((p) => p.Name)),
  ).map((Name) =>
    entity.properties.navigationProperties.find((p) => p.Name === Name),
  );
}

/**
 * Navigation utilities namespace
 */
export const navigationUtils = {
  /**
   * Checks if a property is a navigation property
   * @param {Object} property - The property to check
   * @returns {boolean} Whether the property is a navigation property
   */
  isNavigationProperty: (property) => {
    return property && property.Relationship && property.ToRole;
  },

  /**
   * Gets the relationship name from a navigation property
   * @param {Object} property - The navigation property
   * @returns {string} The relationship name
   */
  getRelationshipName: (property) => {
    if (!property || !property.Relationship) return '';
    return property.Relationship.startsWith('SFOData.')
      ? property.Relationship.slice(8)
      : property.Relationship;
  },
};

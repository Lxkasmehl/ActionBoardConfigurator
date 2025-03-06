export function findMatchingEntity({
  propertyName,
  navigationProperties,
  associationSets,
  allEntities,
}) {
  const matchingProperty = navigationProperties.find((np) =>
    np.Name.endsWith('Nav')
      ? np.Name.slice(0, -3) === propertyName
      : np.Name === propertyName,
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

export function getNavigationProperties(entity) {
  if (!entity) return [];

  return Array.from(
    new Set(entity.properties.navigationProperties.map((p) => p.Name)),
  ).map((Name) =>
    entity.properties.navigationProperties.find((p) => p.Name === Name),
  );
}

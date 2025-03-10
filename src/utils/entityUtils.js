export const sortEntities = (entities) => {
  return [...entities].sort((a, b) => {
    const labelA = (a['sap:label'] || a.Name || '').toLowerCase();
    const labelB = (b['sap:label'] || b.Name || '').toLowerCase();
    return labelA.localeCompare(labelB);
  });
};

export const sortProperties = (properties) => {
  return [...properties].sort((a, b) => {
    const labelA = (a.Name || '').toLowerCase();
    const labelB = (b.Name || '').toLowerCase();
    return labelA.localeCompare(labelB);
  });
};

export const filterUniqueProperties = (properties) => {
  return properties.filter(
    (value, index, self) =>
      index === self.findIndex((t) => t.Name === value.Name),
  );
};

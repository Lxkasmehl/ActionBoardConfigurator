export const convertFilterToOData = (filter) => {
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
};

export const generateExpandParam = (
  selectedProperties,
  entityName,
  allEntities,
) => {
  let expandSet = new Set();

  selectedProperties.forEach((field) => {
    if (field.includes('/')) {
      const hierarchy = field.substring(0, field.lastIndexOf('/'));
      expandSet.add(hierarchy);
    } else {
      const entity = allEntities.find((e) => e.name === entityName);
      const navigationProperty = entity.properties.navigationProperties.find(
        (p) => p.name === field,
      );
      if (navigationProperty) {
        expandSet.add(navigationProperty);
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
};

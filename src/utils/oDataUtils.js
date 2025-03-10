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

    switch (condition.operator) {
      case 'eq':
        return `${condition.field} eq '${value}'`;
      case 'ne':
        return `${condition.field} ne '${value}'`;
      case 'gt':
        return `${condition.field} gt '${value}'`;
      case 'lt':
        return `${condition.field} lt '${value}'`;
      case 'le':
        return `${condition.field} le '${value}'`;
      case 'ge':
        return `${condition.field} ge '${value}'`;
      case 'LIKE':
        return `${condition.field} like '${value}'`;
      case 'IN':
        values = Array.isArray(condition.value)
          ? condition.value
          : value.split(',');
        return `(${values.map((v) => `${condition.field} eq '${v.trim()}'`).join(' or ')})`;
      default:
        return `${condition.field} eq '${value}'`;
    }
  };

  return processCondition(filter);
};

export const generateExpandParam = (selectedProperties) => {
  let expandSet = new Set();

  selectedProperties.forEach((field) => {
    if (field.includes('/')) {
      const hierarchy = field.substring(0, field.lastIndexOf('/'));
      expandSet.add(hierarchy);
    } else {
      // Treat all direct fields as potential navigation properties
      // OData servers usually ignore invalid expands
      expandSet.add(field);
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

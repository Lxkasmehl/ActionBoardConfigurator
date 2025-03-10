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

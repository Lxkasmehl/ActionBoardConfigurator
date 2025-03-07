export const convertFilterToOData = (filter) => {
  if (!filter || !filter.conditions || filter.conditions.length === 0)
    return '';

  const conditions = filter.conditions.map((condition) => {
    switch (condition.operator) {
      case 'eq':
        return `${condition.field} eq '${condition.value}'`;
      case 'ne':
        return `${condition.field} ne '${condition.value}'`;
      case 'gt':
        return `${condition.field} gt '${condition.value}'`;
      case 'lt':
        return `${condition.field} lt '${condition.value}'`;
      default:
        return `${condition.field} eq '${condition.value}'`;
    }
  });

  return conditions.join(` ${filter.entityLogic || 'AND'} `);
};

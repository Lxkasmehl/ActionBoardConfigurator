export const buildConditions = (obj) => {
  const conditions = [];
  const groups = new Map();

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('fullPath_')) {
      const id = key.split('fullPath_')[1];
      const groupMatch = id.match(/^group_(\d+)_(\d+)$/);

      if (groupMatch) {
        const [, groupId, conditionId] = groupMatch;
        if (!groups.has(groupId)) {
          groups.set(groupId, []);
        }
        groups.get(groupId).push({
          id: conditionId,
          field: value,
          operator: obj[`operator_${id}`],
          value: obj[`value_${id}`],
        });
      } else {
        conditions.push({
          id,
          field: value,
          operator: obj[`operator_${id}`],
          value: obj[`value_${id}`],
        });
      }
    }
  }

  return { rootConditions: conditions, groupedConditions: groups };
};

export const buildFilterObject = (obj) => {
  const rootLogic = obj['entityLogic']?.toUpperCase() ?? 'AND';
  const { rootConditions, groupedConditions } = buildConditions(obj);
  const conditions = [];

  conditions.push(
    ...rootConditions.map((condition) => ({
      field: condition.field,
      operator: condition.operator,
      value: condition.value,
    })),
  );

  for (const [groupId, groupConditions] of groupedConditions.entries()) {
    if (groupConditions.length > 0) {
      conditions.push({
        entityLogic: obj[`subLogic_${groupId}`]?.toUpperCase() ?? 'AND',
        conditions: groupConditions.map((condition) => ({
          field: condition.field,
          operator: condition.operator,
          value: condition.value,
        })),
      });
    }
  }

  return {
    entityLogic: rootLogic,
    conditions,
  };
};

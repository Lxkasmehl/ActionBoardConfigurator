export const generateFilterArea = () => {
  return `import React from 'react';
import { FormLabel, Autocomplete } from '@mui/joy';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedFilterOptions } from '../redux/uiStateSlice';

export default function FilterArea({ componentId, fields, columnData, tableColumns, componentGroups }) {
  const dispatch = useDispatch();
  const selectedFilters = useSelector((state) => state.uiState.selectedFilters);

  const componentGroup = Object.values(componentGroups).find((group) =>
    group.components.includes(componentId),
  );

  const tableComponentId = componentGroup?.components?.find(
    (id) => tableColumns[id],
  );

  const handleFilterChange = (filter, newValue) => {
    dispatch(
      setSelectedFilterOptions({
        tableComponentId,
        options: {
          ...selectedFilters[componentId],
          [filter.label]: newValue,
        },
      }),
    );
  };

  return (
    <div style={{ position: 'relative', marginBottom: '2rem' }}>
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          marginBottom: '0.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'
        }}
      >
        {fields.map((filter, index) => (
          <div
            key={index}
            style={{
              display: 'grid',
              gap: '0.25rem',
              position: 'relative',
              maxWidth: '300px'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: '0.5rem' }}>
              <FormLabel
                size='sm'
                sx={{
                  maxWidth: '140px',
                  wordWrap: 'break-word',
                  whiteSpace: 'normal',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block',
                  lineHeight: '1.2',
                  cursor: 'default'
                }}
              >
                {filter.label}
              </FormLabel>
            </div>
            <Autocomplete
              size='sm'
              placeholder='Select an option'
              options={(
                columnData[tableComponentId]?.[filter.label] || []
              ).filter((option) => option !== undefined)}
              getOptionLabel={(option) => option.toString() || ''}
              multiple
              value={selectedFilters[tableComponentId]?.[filter.label] || []}
              onChange={(event, newValue) => handleFilterChange(filter, newValue)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}`;
};

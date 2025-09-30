import React, { useState, useEffect, useMemo } from 'react';
import { FormLabel, Autocomplete } from '@mui/joy';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedFilterOptions } from '../redux/uiStateSlice';

export default function FilterArea({
  component,
  columnData,
  tableColumns,
  componentGroups,
}) {
  const dispatch = useDispatch();
  const [selectedFilters, setSelectedFilters] = useState({});

  const { props } = component;
  const { fields = [] } = props || {};

  // Find the component group and table component
  const componentGroup = Object.values(componentGroups || {}).find((group) =>
    group.components.includes(component.id)
  );

  const tableComponentId = componentGroup?.components?.find(
    (id) => tableColumns?.[id]
  );

  // Helper function to get filtered options for a filter
  const getFilterOptions = useMemo(() => {
    return (filterLabel) => {
      if (!tableComponentId) return [];

      return Array.from(
        new Set(
          (columnData?.[tableComponentId]?.[filterLabel] || []).filter(
            (option) =>
              option !== undefined &&
              option !== null &&
              option !== '' &&
              option.toString().trim() !== ''
          )
        )
      );
    };
  }, [tableComponentId, columnData]);

  // Helper function to check if filter has no options
  const hasNoFilterOptions = useMemo(() => {
    return (filterLabel) => {
      return !tableComponentId || getFilterOptions(filterLabel).length === 0;
    };
  }, [tableComponentId, getFilterOptions]);

  const handleFilterChange = (filter, newValue) => {
    const validOptions = newValue
      .filter((option) => !option.disabled)
      .map((option) => option.value);

    setSelectedFilters((prev) => ({
      ...prev,
      [filter.label]: validOptions,
    }));

    dispatch(
      setSelectedFilterOptions({
        tableComponentId,
        options: {
          ...selectedFilters,
          [filter.label]: validOptions,
        },
      })
    );
  };

  return (
    <div style={{ position: 'relative', marginBottom: '2rem' }}>
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          marginBottom: '0.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        }}
      >
        {fields.map((filter, index) => (
          <div
            key={index}
            style={{
              display: 'grid',
              gap: '0.25rem',
              position: 'relative',
              maxWidth: '300px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
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
                  cursor: 'default',
                }}
              >
                {filter.label}
              </FormLabel>
            </div>
            <Autocomplete
              size='sm'
              placeholder='Select an option'
              options={
                hasNoFilterOptions(filter.label)
                  ? [
                      {
                        label: !tableComponentId
                          ? '⚠️ No table found in the group. Please add a table to the group to get filter options.'
                          : '⚠️ No filter options available. Please select a column that contains data.',
                        value: 'no-options',
                        disabled: true,
                      },
                    ]
                  : getFilterOptions(filter.label).map((option) => ({
                      label: option?.toString() || '',
                      value: option,
                      disabled: false,
                    }))
              }
              getOptionLabel={(option) =>
                option.label || option?.toString() || ''
              }
              isOptionEqualToValue={(option, value) => option.value === value}
              multiple
              value={
                hasNoFilterOptions(filter.label)
                  ? []
                  : (selectedFilters[filter.label] || []).map((option) => ({
                      label: option?.toString() || '',
                      value: option,
                      disabled: false,
                    }))
              }
              onChange={(event, newValue) =>
                handleFilterChange(filter, newValue)
              }
              renderOption={(props, option) => (
                <li
                  {...props}
                  style={{
                    ...props.style,
                    color: option.disabled
                      ? 'var(--joy-palette-danger-500)'
                      : 'inherit',
                    backgroundColor: option.disabled
                      ? 'var(--joy-palette-danger-50)'
                      : 'inherit',
                    cursor: option.disabled ? 'default' : 'pointer',
                    fontStyle: option.disabled ? 'italic' : 'normal',
                  }}
                >
                  {option.label || option?.toString() || ''}
                </li>
              )}
              sx={{
                '& .MuiAutocomplete-input': {
                  color: hasNoFilterOptions(filter.label)
                    ? 'text.secondary'
                    : 'inherit',
                },
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

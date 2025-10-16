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
    group.components.includes(component.id),
  );

  const tableComponentId = componentGroup?.components?.find(
    (id) => tableColumns?.[id],
  );

  // Helper function to get filtered options for a filter
  const getFilterOptions = useMemo(() => {
    return (filterLabel) => {
      if (!tableComponentId) return [];

      const rawOptions = (
        columnData?.[tableComponentId]?.[filterLabel] || []
      ).filter((option) => {
        // Filter out undefined, null, empty strings
        if (option === undefined || option === null || option === '') {
          return false;
        }

        // Filter out empty objects
        if (typeof option === 'object' && Object.keys(option).length === 0) {
          return false;
        }

        // Filter out objects that only contain empty values
        if (typeof option === 'object') {
          const hasValidValue = Object.values(option).some(
            (val) =>
              val !== undefined &&
              val !== null &&
              val !== '' &&
              (typeof val !== 'string' || val.trim() !== ''),
          );
          if (!hasValidValue) {
            return false;
          }
        }

        // Filter out empty strings after toString
        return option.toString().trim() !== '';
      });

      // Convert to display values and deduplicate based on display value
      const displayValueMap = new Map();

      rawOptions.forEach((option) => {
        // Handle different data types properly
        let displayValue = '';
        if (typeof option === 'string') {
          displayValue = option;
        } else if (option && typeof option === 'object') {
          // If it's an object, try to extract meaningful text
          if (option.label) {
            displayValue = option.label;
          } else if (option.value) {
            displayValue = option.value.toString();
          } else if (option.text) {
            displayValue = option.text;
          } else {
            // For objects without clear text properties, try to find any string value
            const stringValues = Object.values(option).filter(
              (val) => typeof val === 'string' && val.trim() !== '',
            );
            if (stringValues.length > 0) {
              displayValue = stringValues[0];
            } else {
              // If no valid string values found, skip this option
              return;
            }
          }
        } else {
          displayValue = option?.toString() || '';
        }

        // Only add if we have a valid display value and haven't seen it before
        if (displayValue.trim() !== '' && !displayValueMap.has(displayValue)) {
          displayValueMap.set(displayValue, option);
        }
      });

      return Array.from(displayValueMap.values());
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

    const newSelectedFilters = {
      ...selectedFilters,
      [filter.label]: validOptions,
    };

    setSelectedFilters(newSelectedFilters);

    dispatch(
      setSelectedFilterOptions({
        tableComponentId,
        options: newSelectedFilters,
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
              data-testid={`filter-autocomplete-${filter.label.toLowerCase().replace(/\s+/g, '-')}`}
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
                  : getFilterOptions(filter.label)
                      .map((option) => {
                        // Handle different data types properly
                        let displayValue = '';
                        if (typeof option === 'string') {
                          displayValue = option;
                        } else if (option && typeof option === 'object') {
                          // If it's an object, try to extract meaningful text
                          if (option.label) {
                            displayValue = option.label;
                          } else if (option.value) {
                            displayValue = option.value.toString();
                          } else if (option.text) {
                            displayValue = option.text;
                          } else {
                            // For objects without clear text properties, try to find any string value
                            const stringValues = Object.values(option).filter(
                              (val) =>
                                typeof val === 'string' && val.trim() !== '',
                            );
                            if (stringValues.length > 0) {
                              displayValue = stringValues[0];
                            } else {
                              // If no valid string values found, skip this option
                              return null;
                            }
                          }
                        } else {
                          displayValue = option?.toString() || '';
                        }

                        return {
                          label: displayValue,
                          value: option,
                          disabled: false,
                        };
                      })
                      .filter((option) => option !== null)
              }
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option;
                }
                if (option && typeof option === 'object') {
                  if (option.label) {
                    return option.label;
                  } else if (option.value) {
                    return option.value.toString();
                  } else if (option.text) {
                    return option.text;
                  } else {
                    // For objects without clear text properties, try to find any string value
                    const stringValues = Object.values(option).filter(
                      (val) => typeof val === 'string' && val.trim() !== '',
                    );
                    if (stringValues.length > 0) {
                      return stringValues[0];
                    } else {
                      // If no valid string values found, return empty string
                      return '';
                    }
                  }
                }
                return option?.toString() || '';
              }}
              isOptionEqualToValue={(option, value) => option.value === value}
              multiple
              value={
                hasNoFilterOptions(filter.label)
                  ? []
                  : (selectedFilters[filter.label] || [])
                      .map((option) => {
                        // Handle different data types properly for selected values
                        let displayValue = '';
                        if (typeof option === 'string') {
                          displayValue = option;
                        } else if (option && typeof option === 'object') {
                          if (option.label) {
                            displayValue = option.label;
                          } else if (option.value) {
                            displayValue = option.value.toString();
                          } else if (option.text) {
                            displayValue = option.text;
                          } else {
                            const stringValues = Object.values(option).filter(
                              (val) =>
                                typeof val === 'string' && val.trim() !== '',
                            );
                            if (stringValues.length > 0) {
                              displayValue = stringValues[0];
                            } else {
                              // If no valid string values found, skip this option
                              return null;
                            }
                          }
                        } else {
                          displayValue = option?.toString() || '';
                        }

                        return {
                          label: displayValue,
                          value: option,
                          disabled: false,
                        };
                      })
                      .filter((option) => option !== null)
              }
              onChange={(event, newValue) =>
                handleFilterChange(filter, newValue)
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

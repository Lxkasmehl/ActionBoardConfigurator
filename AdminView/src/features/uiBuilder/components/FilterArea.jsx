import { useState, useEffect, useMemo } from 'react';
import { Autocomplete, FormLabel, IconButton, Tooltip } from '@mui/joy';
import { Add, Delete, Edit } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import {
  setGroupFilters,
  setSelectedFilterOptions,
  updateComponentProps,
} from '../../../redux/uiBuilderSlice';
import { useTableColumns } from '../hooks/useTableColumns';

export default function FilterArea({ component, disabled = false }) {
  const dispatch = useDispatch();
  const [filters, setFilters] = useState(
    component.props.fields.map((field, index) => ({
      id: index + 1,
      label: field.label,
      options: [],
    })),
  );
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const columnData = useSelector((state) => state.uiBuilder.columnData);
  const componentGroups = useSelector(
    (state) => state.uiBuilder.componentGroups,
  );
  const selectedFilterOptions = useSelector(
    (state) => state.uiBuilder.selectedFilterOptions,
  );
  const { tableComponentId, getColumnOptions } = useTableColumns(component.id);

  const componentGroup = Object.values(componentGroups).find((group) =>
    group.components.includes(component.id),
  );

  const groupName = Object.keys(componentGroups).find(
    (key) => componentGroups[key] === componentGroup,
  );

  const currentSelectedOptions = useMemo(
    () => selectedFilterOptions[groupName] || {},
    [selectedFilterOptions, groupName],
  );

  // Helper function to get filtered options for a filter
  const getFilterOptions = useMemo(() => {
    return (filterLabel) => {
      if (!tableComponentId) return [];

      return Array.from(
        new Set(
          (columnData[tableComponentId]?.[filterLabel] || []).filter(
            (option) =>
              option !== undefined &&
              option !== null &&
              option !== '' &&
              option.toString().trim() !== '',
          ),
        ),
      );
    };
  }, [tableComponentId, columnData]);

  // Helper function to check if filter has no options
  const hasNoFilterOptions = useMemo(() => {
    return (filterLabel) => {
      return !tableComponentId || getFilterOptions(filterLabel).length === 0;
    };
  }, [tableComponentId, getFilterOptions]);

  const handleAddFilter = () => {
    if (disabled) return;
    const newFilters = [
      ...filters,
      {
        id: Date.now(),
        label: `Filter ${filters.length + 1}`,
        options: [],
      },
    ];
    setFilters(newFilters);

    // Update the component props in Redux
    dispatch(
      updateComponentProps({
        componentId: component.id,
        props: { fields: newFilters.map(({ label }) => ({ label })) },
      }),
    );
  };

  const handleRemoveFilter = (id) => {
    if (disabled) return;
    if (filters.length > 1) {
      const newFilters = filters.filter((filter) => filter.id !== id);
      setFilters(newFilters);

      // Update the component props in Redux
      dispatch(
        updateComponentProps({
          componentId: component.id,
          props: { fields: newFilters.map(({ label }) => ({ label })) },
        }),
      );
    }
  };

  const handleEditStart = (filter) => {
    if (disabled) return;
    setEditingId(filter.id);
    setEditingValue(filter.label);
  };

  const handleEditComplete = () => {
    if (disabled) return;
    if (editingId) {
      const updatedFilters = filters.map((filter) =>
        filter.id === editingId ? { ...filter, label: editingValue } : filter,
      );
      setFilters(updatedFilters);
      setEditingId(null);

      // Update the component props in Redux
      dispatch(
        updateComponentProps({
          componentId: component.id,
          props: { fields: updatedFilters.map(({ label }) => ({ label })) },
        }),
      );
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleEditComplete();
    }
  };

  useEffect(() => {
    if (componentGroup) {
      const filtersWithOptions = filters
        .filter((filter) => currentSelectedOptions[filter.id]?.length > 0)
        .map((filter) => ({
          id: filter.id,
          column: filter.label,
          selectedOptions: currentSelectedOptions[filter.id] || [],
        }));

      dispatch(
        setGroupFilters({
          groupName: groupName,
          filters: filtersWithOptions,
        }),
      );
    }
  }, [filters, currentSelectedOptions, componentGroup, dispatch, groupName]);

  return (
    <div
      className='grid gap-y-2 gap-x-10'
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
    >
      {filters.map((filter) => (
        <div
          key={filter.id}
          className='grid gap-1 relative group max-w-[300px]'
        >
          <div className='grid grid-cols-[1fr,auto,auto] items-center gap-2'>
            {editingId === filter.id ? (
              <Autocomplete
                size='sm'
                placeholder='Select Column'
                disabled={disabled}
                onBlur={handleEditComplete}
                onKeyDown={handleKeyDown}
                options={
                  getColumnOptions().length === 0
                    ? [
                        {
                          label:
                            '⚠️ No columns available. Please create a group with a table to select table columns as options.',
                          value: 'no-columns',
                          disabled: true,
                        },
                      ]
                    : getColumnOptions()
                }
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) =>
                  option.value === value?.value
                }
                onChange={(event, newValue) => {
                  if (newValue && !newValue.disabled) {
                    setEditingValue(newValue.label);
                  }
                }}
                data-testid='filter-column-select'
                sx={{
                  '& .MuiAutocomplete-input': {
                    color:
                      getColumnOptions().length === 0
                        ? 'text.secondary'
                        : 'inherit',
                  },
                }}
              />
            ) : (
              <FormLabel
                size='sm'
                className='cursor-default'
                sx={{
                  maxWidth: '140px',
                  wordWrap: 'break-word',
                  whiteSpace: 'normal',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block',
                  lineHeight: '1.2',
                }}
              >
                {filter.label}
              </FormLabel>
            )}
            {!disabled && editingId !== filter.id && (
              <IconButton
                size='sm'
                variant='plain'
                color='neutral'
                onClick={() => handleEditStart(filter)}
                className='opacity-0 group-hover:opacity-100 transition-opacity'
              >
                <Edit />
              </IconButton>
            )}
            {filters.length > 1 && !disabled && (
              <IconButton
                size='sm'
                variant='plain'
                color='danger'
                onClick={() => handleRemoveFilter(filter.id)}
                className='opacity-0 group-hover:opacity-100 transition-opacity'
              >
                <Delete />
              </IconButton>
            )}
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
            disabled={disabled}
            getOptionLabel={(option) =>
              option.label || option?.toString() || ''
            }
            isOptionEqualToValue={(option, value) => option.value === value}
            multiple
            value={
              hasNoFilterOptions(filter.label)
                ? []
                : (currentSelectedOptions[filter.id] || []).map((option) => ({
                    label: option?.toString() || '',
                    value: option,
                    disabled: false,
                  }))
            }
            data-testid={`filter-option-select-${filter.label}`}
            onChange={(event, newValue) => {
              // Filter out disabled options and extract values
              const validOptions = newValue
                .filter((option) => !option.disabled)
                .map((option) => option.value);
              dispatch(
                setSelectedFilterOptions({
                  groupName,
                  options: {
                    ...currentSelectedOptions,
                    [filter.id]: validOptions,
                  },
                }),
              );
            }}
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
                {option.toString()}
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

      {!disabled && (
        <IconButton
          variant='solid'
          color='primary'
          onClick={handleAddFilter}
          sx={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            borderRadius: '50%',
          }}
        >
          <Add />
        </IconButton>
      )}
    </div>
  );
}

FilterArea.propTypes = {
  component: PropTypes.shape({
    id: PropTypes.string.isRequired,
    props: PropTypes.shape({
      fields: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
        }),
      ).isRequired,
    }).isRequired,
  }).isRequired,
  disabled: PropTypes.bool,
};

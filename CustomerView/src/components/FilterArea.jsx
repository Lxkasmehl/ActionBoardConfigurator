import React, { useState } from 'react';
import { Box, TextField, Button, Select, Option } from '@mui/joy';

export default function FilterArea({ component, onFilterChange }) {
  const { props } = component;
  const { filters = [] } = props || {};

  const [filterValues, setFilterValues] = useState({});

  const handleFilterChange = (filterId, value) => {
    const newValues = { ...filterValues, [filterId]: value };
    setFilterValues(newValues);
    onFilterChange?.(newValues);
  };

  const handleClearFilters = () => {
    setFilterValues({});
    onFilterChange?.({});
  };

  const renderFilter = (filter) => {
    const { id, label, type, options = [] } = filter;

    switch (type) {
      case 'text':
        return (
          <TextField
            key={id}
            label={label}
            value={filterValues[id] || ''}
            onChange={(e) => handleFilterChange(id, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}`}
            sx={{ minWidth: 200 }}
          />
        );
      case 'select':
        return (
          <Select
            key={id}
            placeholder={label}
            value={filterValues[id] || ''}
            onChange={(_, value) => handleFilterChange(id, value)}
            sx={{ minWidth: 200 }}
          >
            {options.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        flexWrap: 'wrap',
        padding: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 'sm',
        marginBottom: 2,
      }}
    >
      {filters.map(renderFilter)}
      <Button
        variant='outlined'
        onClick={handleClearFilters}
        sx={{ marginLeft: 'auto' }}
      >
        Clear Filters
      </Button>
    </Box>
  );
}

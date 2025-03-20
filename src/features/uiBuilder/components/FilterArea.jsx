import { useState } from 'react';
import { Autocomplete, FormLabel, IconButton, Input } from '@mui/joy';
import { Add, Delete, Edit } from '@mui/icons-material';
import { COMPONENT_CONFIGS } from './constants';

export default function FilterArea() {
  const [filters, setFilters] = useState(
    COMPONENT_CONFIGS.filterArea.defaultProps.fields.map((field, index) => ({
      id: index + 1,
      label: field.label,
      options: [],
    })),
  );
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const handleAddFilter = () => {
    setFilters([
      ...filters,
      {
        id: Date.now(),
        label: `Filter ${filters.length + 1}`,
        options: [],
      },
    ]);
  };

  const handleRemoveFilter = (id) => {
    if (filters.length > 1) {
      setFilters(filters.filter((filter) => filter.id !== id));
    }
  };

  const handleEditStart = (filter) => {
    setEditingId(filter.id);
    setEditingValue(filter.label);
  };

  const handleEditComplete = () => {
    if (editingId) {
      setFilters(
        filters.map((filter) =>
          filter.id === editingId ? { ...filter, label: editingValue } : filter,
        ),
      );
      setEditingId(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleEditComplete();
    }
  };

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
              <Input
                size='sm'
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={handleEditComplete}
                onKeyDown={handleKeyDown}
                autoFocus
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
            <IconButton
              size='sm'
              variant='plain'
              color='neutral'
              onClick={() => handleEditStart(filter)}
              className='opacity-0 group-hover:opacity-100 transition-opacity'
            >
              <Edit />
            </IconButton>
            {filters.length > 1 && (
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
            options={filter.options}
          />
        </div>
      ))}

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
    </div>
  );
}

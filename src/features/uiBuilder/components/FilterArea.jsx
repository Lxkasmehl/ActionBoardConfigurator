import { useState } from 'react';
import { Autocomplete, FormLabel, IconButton } from '@mui/joy';
import { Add, Delete } from '@mui/icons-material';

export default function FilterArea() {
  const [filters, setFilters] = useState([
    { id: 1, label: 'Filter 1', options: [] },
  ]);
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
    setFilters(filters.filter((filter) => filter.id !== id));
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
    <div className='flex flex-row gap-1 flex-wrap'>
      {filters.map((filter) => (
        <div key={filter.id} className='flex flex-col gap-1 relative group'>
          <div className='flex items-center gap-2'>
            {editingId === filter.id ? (
              <input
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={handleEditComplete}
                onKeyDown={handleKeyDown}
                autoFocus
                className='text-sm p-1 border rounded'
              />
            ) : (
              <FormLabel
                size='sm'
                className='cursor-pointer'
                onClick={() => handleEditStart(filter)}
              >
                {filter.label}
              </FormLabel>
            )}
            <IconButton
              size='sm'
              variant='plain'
              color='danger'
              onClick={() => handleRemoveFilter(filter.id)}
              className='opacity-0 group-hover:opacity-100 transition-opacity'
            >
              <Delete />
            </IconButton>
          </div>
          <Autocomplete
            size='sm'
            placeholder='Select an option'
            options={filter.options}
            sx={{ width: '90%' }}
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

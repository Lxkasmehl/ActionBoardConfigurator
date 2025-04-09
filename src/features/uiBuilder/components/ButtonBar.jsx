import { useState } from 'react';
import { Button, IconButton, Autocomplete } from '@mui/joy';
import * as Icons from '@mui/icons-material';
import { Add } from '@mui/icons-material';
import EditModal from './common/EditModal';
import EditButton from './common/EditButton';
import PropTypes from 'prop-types';

export default function ButtonBar({ component, disabled = false }) {
  const [fields, setFields] = useState(
    component.props.fields.map((field, index) => ({
      id: index + 1,
      type: field.type,
      'text/icon': field['text/icon'],
    })),
  );
  const [editingField, setEditingField] = useState(null);

  const handleAddField = () => {
    if (disabled) return;
    setFields([
      ...fields,
      {
        id: Date.now(),
        type: 'button',
        'text/icon': 'Button',
      },
    ]);
  };

  const handleEditField = (field) => {
    if (disabled) return;
    setEditingField(field);
  };

  const handleSaveField = (editedField) => {
    if (disabled) return;
    setFields(
      fields.map((field) =>
        field.id === editedField.id ? editedField : field,
      ),
    );
  };

  const handleDeleteField = (fieldId) => {
    if (disabled) return;
    setFields(fields.filter((field) => field.id !== fieldId));
  };

  const renderField = (field) => {
    let IconComponent;
    switch (field.type) {
      case 'iconButton':
        IconComponent = Icons[field['text/icon']];
        return (
          <div key={field.id} className='relative group'>
            <IconButton
              size='sm'
              variant='solid'
              color='primary'
              className='group-hover:opacity-50 transition-opacity'
              disabled={disabled}
            >
              <IconComponent />
            </IconButton>
            {!disabled && <EditButton onClick={() => handleEditField(field)} />}
          </div>
        );
      case 'autocomplete':
        return (
          <div key={field.id} className='relative group'>
            <Autocomplete
              size='sm'
              placeholder={field['text/icon']}
              options={[]}
              className='group-hover:opacity-50 transition-opacity'
              sx={{
                width: '170px',
              }}
              disabled={disabled}
            />
            {!disabled && <EditButton onClick={() => handleEditField(field)} />}
          </div>
        );
      case 'button':
      default:
        return (
          <div key={field.id} className='relative group'>
            <Button
              size='sm'
              className='group-hover:opacity-50 transition-opacity'
              disabled={disabled}
            >
              {field['text/icon']}
            </Button>
            {!disabled && <EditButton onClick={() => handleEditField(field)} />}
          </div>
        );
    }
  };

  return (
    <>
      <div className='flex gap-2 flex-wrap'>{fields.map(renderField)}</div>
      {!disabled && (
        <IconButton
          variant='solid'
          color='primary'
          onClick={handleAddField}
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
      {editingField && !disabled && (
        <EditModal
          open={!!editingField}
          onClose={() => setEditingField(null)}
          item={editingField}
          onSave={handleSaveField}
          onDelete={handleDeleteField}
          type='field'
          title='Edit Field'
        />
      )}
    </>
  );
}

ButtonBar.propTypes = {
  component: PropTypes.shape({
    props: PropTypes.shape({
      fields: PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.string.isRequired,
          'text/icon': PropTypes.string.isRequired,
        }),
      ).isRequired,
    }).isRequired,
  }).isRequired,
  disabled: PropTypes.bool,
};

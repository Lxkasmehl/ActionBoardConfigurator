import { useState } from 'react';
import { COMPONENT_CONFIGS } from './constants';
import { Button, IconButton, Autocomplete } from '@mui/joy';
import * as Icons from '@mui/icons-material';
import { Add } from '@mui/icons-material';
import EditFieldModal from './EditFieldModal';
import EditButton from './EditButton';

export default function ButtonBar() {
  const [fields, setFields] = useState(
    COMPONENT_CONFIGS.buttonBar.defaultProps.fields.map((field, index) => ({
      id: index + 1,
      type: field.type,
      'text/icon': field['text/icon'],
    })),
  );
  const [editingField, setEditingField] = useState(null);

  const handleAddField = () => {
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
    setEditingField(field);
  };

  const handleSaveField = (editedField) => {
    setFields(
      fields.map((field) =>
        field.id === editedField.id ? editedField : field,
      ),
    );
  };

  const handleDeleteField = (fieldId) => {
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
            >
              <IconComponent />
            </IconButton>
            <EditButton onClick={() => handleEditField(field)} />
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
            />
            <EditButton onClick={() => handleEditField(field)} />
          </div>
        );
      case 'button':
      default:
        return (
          <div key={field.id} className='relative group'>
            <Button
              size='sm'
              className='group-hover:opacity-50 transition-opacity'
            >
              {field['text/icon']}
            </Button>
            <EditButton onClick={() => handleEditField(field)} />
          </div>
        );
    }
  };

  return (
    <>
      <div className='flex gap-2 flex-wrap'>{fields.map(renderField)}</div>
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
      {editingField && (
        <EditFieldModal
          open={!!editingField}
          onClose={() => setEditingField(null)}
          field={editingField}
          onSave={handleSaveField}
          onDelete={handleDeleteField}
        />
      )}
    </>
  );
}

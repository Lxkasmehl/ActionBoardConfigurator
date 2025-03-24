import { useState } from 'react';
import { COMPONENT_CONFIGS } from './constants';
import { Button, IconButton, Autocomplete } from '@mui/joy';
import * as Icons from '@mui/icons-material';
import { Add } from '@mui/icons-material';

export default function ButtonBar() {
  const [fields, setFields] = useState(
    COMPONENT_CONFIGS.buttonBar.defaultProps.fields.map((field, index) => ({
      id: index + 1,
      type: field.type,
      'text/icon': field['text/icon'],
    })),
  );

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

  const renderField = (field) => {
    let IconComponent;
    switch (field.type) {
      case 'iconButton':
        IconComponent = Icons[field['text/icon']];
        return (
          <IconButton key={field.id} size='sm' variant='solid' color='primary'>
            <IconComponent />
          </IconButton>
        );
      case 'autocomplete':
        return (
          <Autocomplete
            key={field.id}
            size='sm'
            placeholder={field['text/icon']}
            options={[]}
          />
        );
      case 'button':
      default:
        return (
          <Button key={field.id} size='sm'>
            {field['text/icon']}
          </Button>
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
    </>
  );
}

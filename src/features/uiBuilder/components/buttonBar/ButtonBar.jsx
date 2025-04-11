import { useState } from 'react';
import { Button, IconButton, Autocomplete } from '@mui/joy';
import { Edit } from '@mui/icons-material';
import * as Icons from '@mui/icons-material';
import PropTypes from 'prop-types';
import EditButtonBarModal from './EditButtonBarModal';

export default function ButtonBar({ component, disabled = false }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditButtonBar = () => {
    setIsEditModalOpen(true);
  };

  const handleSave = (updatedComponent) => {
    component.props.fields = updatedComponent.props.fields;
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
              onClick={field.onClick}
            >
              <IconComponent />
            </IconButton>
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
              onChange={(_, value) => field.onClick(value)}
            />
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
              onClick={field.onClick}
            >
              {field['text/icon']}
            </Button>
          </div>
        );
    }
  };

  return (
    <>
      <div className='flex gap-2 flex-wrap'>
        {component.props.fields.map((field, index) =>
          renderField({ ...field, id: index + 1 }),
        )}
      </div>
      {!disabled && (
        <IconButton
          variant='solid'
          color='primary'
          onClick={handleEditButtonBar}
          sx={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            borderRadius: '50%',
          }}
        >
          <Edit />
        </IconButton>
      )}
      <EditButtonBarModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        component={component}
        onSave={handleSave}
      />
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

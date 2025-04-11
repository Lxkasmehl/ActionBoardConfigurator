import { useState } from 'react';
import { IconButton } from '@mui/joy';
import { Edit } from '@mui/icons-material';
import PropTypes from 'prop-types';
import EditButtonBarModal from './EditButtonBarModal';
import ButtonField from './ButtonField';

export default function ButtonBar({ component, disabled = false }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditButtonBar = () => {
    setIsEditModalOpen(true);
  };

  const handleSave = (updatedComponent) => {
    component.props.fields = updatedComponent.props.fields;
  };

  return (
    <>
      <div className='flex gap-2 flex-wrap'>
        {component.props.fields.map((field, index) => (
          <ButtonField
            key={index}
            field={{ ...field, id: index + 1 }}
            disabled={disabled}
          />
        ))}
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

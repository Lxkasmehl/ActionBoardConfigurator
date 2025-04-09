import { Typography, IconButton } from '@mui/joy';
import { Edit, Check, Close } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useState } from 'react';

export default function EditableTextComponent({
  component,
  InputComponent,
  inputProps = {},
  typographyProps = {},
  disabled = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(component.props.text);
  const [previousText, setPreviousText] = useState(component.props.text);

  const handleEditClick = () => {
    if (disabled) return;
    setPreviousText(editedText);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (disabled) return;
    setPreviousText(editedText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (disabled) return;
    setEditedText(previousText);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleCancel();
    } else if (e.key === ' ') {
      e.preventDefault();
      setEditedText((prev) => prev + ' ');
    }
  };

  return (
    <>
      {isEditing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <InputComponent
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            sx={{ flex: 1 }}
            disabled={disabled}
            {...inputProps}
          />
          <IconButton
            variant='solid'
            color='success'
            onClick={handleSave}
            sx={{ borderRadius: '50%' }}
            disabled={disabled}
          >
            <Check />
          </IconButton>
          <IconButton
            variant='solid'
            color='danger'
            onClick={handleCancel}
            sx={{ borderRadius: '50%' }}
            disabled={disabled}
          >
            <Close />
          </IconButton>
        </div>
      ) : (
        <>
          <Typography {...typographyProps}>{editedText}</Typography>
          <IconButton
            variant='solid'
            color='primary'
            onClick={handleEditClick}
            sx={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              borderRadius: '50%',
              display: disabled ? 'none' : 'block',
            }}
            disabled={disabled}
          >
            <Edit />
          </IconButton>
        </>
      )}
    </>
  );
}

EditableTextComponent.propTypes = {
  component: PropTypes.shape({
    props: PropTypes.shape({
      text: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  InputComponent: PropTypes.elementType.isRequired,
  inputProps: PropTypes.object,
  typographyProps: PropTypes.object,
  disabled: PropTypes.bool,
};

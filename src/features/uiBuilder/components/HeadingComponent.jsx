import { Typography, IconButton, Input } from '@mui/joy';
import { Edit, Check, Close } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useState } from 'react';

export default function HeadingComponent({ component }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(component.props.text);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedText(component.props.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
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
          <Input
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            sx={{ flex: 1 }}
          />
          <IconButton
            variant='solid'
            color='success'
            onClick={handleSave}
            sx={{ borderRadius: '50%' }}
          >
            <Check />
          </IconButton>
          <IconButton
            variant='solid'
            color='danger'
            onClick={handleCancel}
            sx={{ borderRadius: '50%' }}
          >
            <Close />
          </IconButton>
        </div>
      ) : (
        <>
          <Typography level={component.props.level || 'h2'}>
            {editedText}
          </Typography>
          <IconButton
            variant='solid'
            color='primary'
            onClick={handleEditClick}
            sx={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              borderRadius: '50%',
            }}
          >
            <Edit />
          </IconButton>
        </>
      )}
    </>
  );
}

HeadingComponent.propTypes = {
  component: PropTypes.shape({
    props: PropTypes.shape({
      level: PropTypes.string,
      text: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

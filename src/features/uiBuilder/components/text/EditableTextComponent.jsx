import { Typography, IconButton } from '@mui/joy';
import { Edit, Check, Close } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useState, useRef } from 'react';
import DataSelectionModal from './DataSelectionModal';
import PropertySelectionModal from './PropertySelectionModal';

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
  const [isDataSelectionOpen, setIsDataSelectionOpen] = useState(false);
  const [isPropertySelectionOpen, setIsPropertySelectionOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const lastKeyRef = useRef(null);
  const modalRef = useRef(null);

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
      e.stopPropagation();
    } else if (e.key === '[') {
      if (lastKeyRef.current === '[') {
        e.preventDefault();
        const textBeforeCursor = editedText.slice(0, cursorPosition - 1);
        const textAfterCursor = editedText.slice(cursorPosition);
        setEditedText(textBeforeCursor + '[[]]' + textAfterCursor);
        setCursorPosition(cursorPosition + 2);
        setIsDataSelectionOpen(true);
      }
      lastKeyRef.current = '[';
    } else {
      lastKeyRef.current = null;
    }
  };

  const handleInputChange = (e) => {
    setEditedText(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleDataSelected = (data) => {
    setSelectedData(data);
    setIsDataSelectionOpen(false);
    setIsPropertySelectionOpen(true);
  };

  const handlePropertySelected = (property, value) => {
    // Find the position of the last '[[' in the text
    const lastOpenBraces = editedText.lastIndexOf('[[]]');
    const textBeforeBraces = editedText.slice(0, lastOpenBraces);
    const textAfterBraces = editedText.slice(lastOpenBraces + 4);

    const newText =
      textBeforeBraces + '[[' + value.value + ']]' + textAfterBraces;
    setEditedText(newText);
    setCursorPosition(lastOpenBraces + value.value.length + 4);
    setIsPropertySelectionOpen(false);
  };

  return (
    <>
      {isEditing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <InputComponent
            value={editedText}
            onChange={handleInputChange}
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
      <DataSelectionModal
        ref={modalRef}
        open={isDataSelectionOpen}
        onClose={() => setIsDataSelectionOpen(false)}
        onDataSelected={handleDataSelected}
      />
      <PropertySelectionModal
        open={isPropertySelectionOpen}
        onClose={() => setIsPropertySelectionOpen(false)}
        onPropertySelected={handlePropertySelected}
        data={selectedData}
      />
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

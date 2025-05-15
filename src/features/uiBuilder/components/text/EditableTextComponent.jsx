import { Typography, IconButton, Box } from '@mui/joy';
import { Edit, Check, Close } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useState, useRef, useEffect } from 'react';
import DataSelectionModal from './DataSelectionModal';
import PropertySelectionModal from './PropertySelectionModal';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateComponentProps,
  setTextConfigEntries,
} from '@/redux/uiBuilderSlice';
import { useSendRequest } from '@/features/dataPicker/hooks/useSendRequest';

export default function EditableTextComponent({
  component,
  InputComponent,
  inputProps = {},
  typographyProps = {},
  disabled = false,
}) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(component.props.text);
  const [previousText, setPreviousText] = useState(component.props.text);
  const [isDataSelectionOpen, setIsDataSelectionOpen] = useState(false);
  const [isPropertySelectionOpen, setIsPropertySelectionOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const lastKeyRef = useRef(null);
  const modalRef = useRef(null);

  // Get stored config entries from Redux
  const textConfigEntries = useSelector(
    (state) => state.uiBuilder.textConfigEntries[component.id] || {},
  );
  const sendRequest = useSendRequest();

  // Function to extract values from text
  const extractValues = (text) => {
    const regex = /\[\[(.*?)\]\]/g;
    const matches = [...text.matchAll(regex)];
    return matches.map((match) => match[1]);
  };

  // Function to update text with fetched values
  const updateTextWithFetchedValues = (text, fetchedValues) => {
    let updatedText = text;
    Object.entries(fetchedValues).forEach(([originalValue, newValue]) => {
      updatedText = updatedText.replace(
        `[[${originalValue}]]`,
        `[[${newValue}]]`,
      );
    });
    return updatedText;
  };

  // Effect to fetch values on mount and when text changes
  useEffect(() => {
    const fetchValues = async () => {
      const values = extractValues(editedText);
      if (values.length === 0) return;

      const configEntriesToFetch = values
        .filter((value) => textConfigEntries[value])
        .map((value) => {
          const configEntry = textConfigEntries[value];
          return [
            value,
            {
              entityName: Object.keys(configEntry.configEntries[0][1])[0],
              selectedProperties:
                configEntry.configEntries[0][1][
                  Object.keys(configEntry.configEntries[0][1])[0]
                ].selectedProperties,
              filter:
                configEntry.configEntries[0][1][
                  Object.keys(configEntry.configEntries[0][1])[0]
                ].filter,
            },
          ];
        });

      if (configEntriesToFetch.length === 0) return;

      try {
        const results = await sendRequest(null, configEntriesToFetch);
        const fetchedValues = {};

        results.forEach((result, index) => {
          const value = values[index];
          const configEntry = textConfigEntries[value];
          if (result.d.results && result.d.results.length > 0) {
            // Use the stored selected property and value
            const selectedProperty = configEntry.selectedProperty;
            const selectedValue = configEntry.selectedValue;

            // Find the result that matches our selected value
            const matchingResult = result.d.results.find(
              (r) => r[selectedProperty] === selectedValue.value,
            );

            if (matchingResult) {
              fetchedValues[value] = matchingResult[selectedProperty];
            }
          }
        });

        const updatedText = updateTextWithFetchedValues(
          editedText,
          fetchedValues,
        );
        if (updatedText !== editedText) {
          setEditedText(updatedText);
          dispatch(
            updateComponentProps({
              componentId: component.id,
              props: {
                text: updatedText,
                textConfigEntries: textConfigEntries,
              },
            }),
          );
        }
      } catch (error) {
        console.error('Error fetching values:', error);
      }
    };

    fetchValues();
  }, [editedText, textConfigEntries, component.id, dispatch, sendRequest]);

  const handleEditClick = () => {
    if (disabled) return;
    setPreviousText(editedText);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (disabled) return;
    setPreviousText(editedText);
    setIsEditing(false);
    dispatch(
      updateComponentProps({
        componentId: component.id,
        props: {
          text: editedText,
          textConfigEntries: textConfigEntries,
        },
      }),
    );
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
    if (disabled) return;
    setEditedText(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  const handleDataSelected = (data) => {
    if (disabled) return;
    setSelectedData(data);
    setIsDataSelectionOpen(false);
    setIsPropertySelectionOpen(true);
  };

  const handlePropertySelected = (property, value) => {
    // Find the position of the last '[[' in the text
    const lastOpenBraces = editedText.lastIndexOf('[[]]');
    const textBeforeBraces = editedText.slice(0, lastOpenBraces);
    const textAfterBraces = editedText.slice(lastOpenBraces + 4);

    // Store config entries in Redux with selected property and value
    dispatch(
      setTextConfigEntries({
        componentId: component.id,
        value: value.value,
        configEntries: selectedData.configEntries || [],
        selectedProperty: property,
        selectedValue: value,
      }),
    );

    // Update the text with just the value
    const newText =
      textBeforeBraces + '[[' + value.value + ']]' + textAfterBraces;

    setEditedText(newText);
    setCursorPosition(lastOpenBraces + value.value.length + 4);
    setIsPropertySelectionOpen(false);
  };

  return (
    <>
      {isEditing ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InputComponent
            value={editedText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoFocus
            sx={{ flex: 1 }}
            disabled={disabled}
            data-testid='editable-text-component-input'
            {...inputProps}
          />
          <IconButton
            size='sm'
            variant='solid'
            color='success'
            onClick={handleSave}
            disabled={disabled}
            data-testid='editable-text-component-save-button'
          >
            <Check />
          </IconButton>
          <IconButton
            size='sm'
            variant='solid'
            color='danger'
            onClick={handleCancel}
            disabled={disabled}
          >
            <Close />
          </IconButton>
        </Box>
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
            data-testid='editable-text-component-edit-button'
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
      {selectedData && (
        <PropertySelectionModal
          open={isPropertySelectionOpen}
          onClose={() => setIsPropertySelectionOpen(false)}
          onPropertySelected={handlePropertySelected}
          data={selectedData.results}
        />
      )}
    </>
  );
}

EditableTextComponent.propTypes = {
  component: PropTypes.shape({
    id: PropTypes.string.isRequired,
    props: PropTypes.shape({
      text: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  InputComponent: PropTypes.elementType.isRequired,
  inputProps: PropTypes.object,
  typographyProps: PropTypes.object,
  disabled: PropTypes.bool,
};

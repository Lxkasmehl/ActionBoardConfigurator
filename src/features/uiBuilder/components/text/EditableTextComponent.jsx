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
    console.log('useEffect triggered with editedText:', editedText);

    const fetchValues = async () => {
      const values = extractValues(editedText);
      console.log('Extracted values:', values);

      // Filter out empty values
      const validValues = values.filter((value) => value.trim() !== '');
      if (validValues.length === 0) {
        console.log('No valid values to fetch, returning early');
        return;
      }

      const configEntriesToFetch = validValues
        .map((value) => {
          const configEntry = textConfigEntries[value];
          if (!configEntry) {
            console.log(`No config entry found for value: ${value}`);
            return null;
          }

          console.log(
            `Processing config entry for value: ${value}`,
            configEntry,
          );

          // Handle both possible structures of configEntries
          const configArray = Array.isArray(configEntry.configEntries[0])
            ? configEntry.configEntries[0]
            : configEntry.configEntries;
          const [, config] = configArray;
          const entityName = Object.keys(config)[0];
          const entityConfig = config[entityName];

          // Handle navigation properties and combined properties
          const selectedProperties = entityConfig.selectedProperties.map(
            (prop) => {
              // If the property has navigation properties, include them in the path
              if (
                prop.navigationProperties &&
                prop.navigationProperties.length > 0
              ) {
                const navigationPath = prop.navigationProperties
                  .map((nav) => nav.name || nav.Name)
                  .join('/');
                return `${navigationPath}/${prop.name || prop.Name}`;
              }
              return prop.name || prop.Name;
            },
          );

          return [
            value,
            {
              entityName,
              selectedProperties,
              filter: entityConfig.filter,
            },
          ];
        })
        .filter((entry) => entry !== null);

      if (configEntriesToFetch.length === 0) {
        console.log('No valid config entries to fetch');
        return;
      }

      console.log('Config entries to fetch:', configEntriesToFetch);

      try {
        const results = await sendRequest(null, configEntriesToFetch);
        console.log('Received results from sendRequest:', results);

        const fetchedValues = {};

        results.forEach((result, index) => {
          const value = validValues[index];
          const configEntry = textConfigEntries[value];
          console.log(`Processing result for value: ${value}`, result);

          if (result.d.results && result.d.results.length > 0) {
            // Use the stored selected property and value
            const selectedProperty = configEntry.selectedProperty;
            const selectedValue = configEntry.selectedValue;

            // Helper function to get value from object using dot notation path
            const getValueByPath = (obj, path) => {
              return path.split('.').reduce((current, key) => {
                // If we encounter 'results' in the path, we need to handle it specially
                if (key === 'results') {
                  return current?.results?.[0];
                }
                return current?.[key];
              }, obj);
            };

            // Find the result that matches our selected value
            const matchingResult = result.d.results.find((r) => {
              const value = getValueByPath(r, selectedProperty);
              return value === selectedValue.value;
            });

            if (matchingResult) {
              console.log(
                `Found matching result for ${value}:`,
                matchingResult,
              );
              fetchedValues[value] =
                getValueByPath(matchingResult, selectedProperty) || '';
            } else {
              console.log(`No matching result found for ${value}`);
            }
          } else {
            console.log(`No results found in response for ${value}`);
          }
        });

        console.log('Final fetched values:', fetchedValues);

        const updatedText = updateTextWithFetchedValues(
          editedText,
          fetchedValues,
        );
        console.log('Updated text:', updatedText);

        if (updatedText !== editedText) {
          console.log('Text was updated, dispatching changes');
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
        } else {
          console.log('No text changes needed');
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
        navigationProperties: selectedData.navigationProperties || [],
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

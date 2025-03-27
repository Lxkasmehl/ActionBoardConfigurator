import { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  FormControl,
  FormLabel,
  Select,
  Option,
  Button,
  Input,
  Autocomplete,
} from '@mui/joy';
import * as Icons from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { sortEntities } from '../../../shared/utils/entityOperations';
import useFetchEntities from '../../../shared/hooks/useFetchEntities';

export default function EditModal({
  open,
  onClose,
  item,
  onSave,
  onDelete,
  type,
  title,
}) {
  const [editedItem, setEditedItem] = useState(item);
  const [inputValue, setInputValue] = useState('');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyOptions, setPropertyOptions] = useState([]);
  const filteredEntities = useSelector(
    (state) => state.entities.filteredEntities,
  );
  const sortedEntities = useMemo(
    () => sortEntities(filteredEntities),
    [filteredEntities],
  );
  const loading = useFetchEntities();

  useEffect(() => {
    if (item?.type === 'entity' && item?.entity) {
      setSelectedEntity(item.entity);
      setSelectedProperty(item.property);
    } else {
      setSelectedEntity(null);
      setSelectedProperty(null);
    }
  }, [item?.type, item?.entity, item?.property]);

  useEffect(() => {
    if (selectedEntity?.properties) {
      const properties = [];

      if (Array.isArray(selectedEntity.properties.properties)) {
        properties.push(
          ...selectedEntity.properties.properties.map((p) => ({
            name: p.Name || p.name,
            type: p.Type || p.type,
          })),
        );
      }

      if (Array.isArray(selectedEntity.properties.navigationProperties)) {
        properties.push(
          ...selectedEntity.properties.navigationProperties.map((p) => ({
            name: p.Name || p.name,
            type: p.Type || p.type,
          })),
        );
      }

      setPropertyOptions(properties);
    } else {
      setPropertyOptions([]);
    }
  }, [selectedEntity?.properties]);

  useEffect(() => {
    if (selectedEntity?.properties && selectedProperty) {
      const properties = [];
      if (Array.isArray(selectedEntity.properties.properties)) {
        properties.push(
          ...selectedEntity.properties.properties.map((p) => p.Name || p.name),
        );
      }
      if (Array.isArray(selectedEntity.properties.navigationProperties)) {
        properties.push(
          ...selectedEntity.properties.navigationProperties.map(
            (p) => p.Name || p.name,
          ),
        );
      }

      if (!properties.includes(selectedProperty.name)) {
        setSelectedProperty(null);
      }
    }
  }, [selectedEntity, selectedProperty]);

  const iconOptions = useMemo(() => Object.keys(Icons), []);

  const filterOptions = useCallback((options, { inputValue }) => {
    if (!inputValue) return options.slice(0, 50);
    return options
      .filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase()),
      )
      .slice(0, 50);
  }, []);

  const handleSave = useCallback(() => {
    onSave(editedItem);
    onClose();
  }, [editedItem, onSave, onClose]);

  const handleDelete = useCallback(() => {
    onDelete(type === 'column' ? item.label : item.id);
    onClose();
  }, [type, item, onDelete, onClose]);

  const renderFormFields = () => {
    if (type === 'column') {
      return (
        <>
          <FormControl>
            <FormLabel>Label</FormLabel>
            <Input
              value={editedItem.label}
              onChange={(e) =>
                setEditedItem({ ...editedItem, label: e.target.value })
              }
              placeholder='Enter column label'
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Type</FormLabel>
            <Select
              value={editedItem.type}
              onChange={(_, value) =>
                setEditedItem({ ...editedItem, type: value })
              }
              sx={{ minWidth: 200 }}
            >
              <Option value='text'>Text</Option>
              <Option value='number'>Number</Option>
              <Option value='date'>Date</Option>
              <Option value='boolean'>Boolean</Option>
              <Option value='entity'>Entity</Option>
            </Select>
          </FormControl>
          {editedItem.type === 'entity' && (
            <>
              <FormControl>
                <FormLabel>Entity</FormLabel>
                <Autocomplete
                  value={selectedEntity}
                  onChange={(_, value) => {
                    setSelectedEntity(value);
                    setEditedItem({ ...editedItem, entity: value });
                  }}
                  options={sortedEntities}
                  getOptionLabel={(option) => option?.name || ''}
                  loading={loading}
                  isOptionEqualToValue={(option, value) =>
                    option?.name === value?.name
                  }
                  placeholder='Select Entity'
                />
              </FormControl>
              <FormControl>
                <FormLabel>Property</FormLabel>
                <Autocomplete
                  value={selectedProperty}
                  onChange={(_, value) => {
                    setSelectedProperty(value);
                    setEditedItem({ ...editedItem, property: value });
                  }}
                  options={propertyOptions}
                  getOptionLabel={(option) => option?.name || ''}
                  loading={loading}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return option.name === value.name;
                  }}
                  placeholder='Select Property'
                />
              </FormControl>
            </>
          )}
        </>
      );
    }

    return (
      <>
        <FormControl>
          <FormLabel>Type</FormLabel>
          <Select
            value={editedItem.type}
            onChange={(_, value) =>
              setEditedItem({ ...editedItem, type: value, 'text/icon': null })
            }
            sx={{ minWidth: 200 }}
          >
            <Option value='button'>Button</Option>
            <Option value='iconButton'>Icon Button</Option>
            <Option value='autocomplete'>Autocomplete</Option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Text/Icon</FormLabel>
          {editedItem.type === 'iconButton' ? (
            <Autocomplete
              value={editedItem['text/icon']}
              onChange={(_, value) =>
                setEditedItem({ ...editedItem, 'text/icon': value })
              }
              inputValue={inputValue}
              onInputChange={(_, newInputValue) => {
                setInputValue(newInputValue);
              }}
              options={iconOptions}
              filterOptions={filterOptions}
              groupBy={(option) => option[0].toUpperCase()}
              isOptionEqualToValue={(option, value) => option === value}
              filterSelectedOptions
              placeholder='Select Icon'
              sx={{ minWidth: 200 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
          ) : (
            <Input
              type='text'
              value={editedItem['text/icon']}
              onChange={(e) =>
                setEditedItem({ ...editedItem, 'text/icon': e.target.value })
              }
              className='w-full p-2 border rounded'
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
          )}
        </FormControl>
      </>
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose onClick={onClose} />
        <Typography level='h4'>{title}</Typography>
        {renderFormFields()}
        <div className='flex flex-col gap-4 mt-3'>
          <Button
            variant='outlined'
            color='danger'
            onClick={handleDelete}
            className='w-full'
          >
            Delete {type === 'column' ? 'Column' : 'Field'}
          </Button>
          <div className='flex justify-end gap-2'>
            <Button variant='plain' color='neutral' onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </ModalDialog>
    </Modal>
  );
}

EditModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number,
    label: PropTypes.string,
    type: PropTypes.string.isRequired,
    'text/icon': PropTypes.string,
    entity: PropTypes.shape({
      name: PropTypes.string,
      properties: PropTypes.object,
    }),
    property: PropTypes.shape({
      name: PropTypes.string,
      type: PropTypes.string,
    }),
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['column', 'field']).isRequired,
  title: PropTypes.string.isRequired,
};

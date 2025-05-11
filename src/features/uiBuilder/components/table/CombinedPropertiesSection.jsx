import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FormControl,
  FormLabel,
  Input,
  Typography,
  Autocomplete,
  IconButton,
  Box,
} from '@mui/joy';
import { DragIndicator, Delete } from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { setColumnSeparator } from '../../../../redux/uiBuilderSlice';

function SortablePropertyItem({ property, index, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: property.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      className='flex items-center gap-2 p-2 bg-neutral-100 rounded'
    >
      <div {...attributes} {...listeners}>
        <DragIndicator />
      </div>
      <Typography sx={{ flex: 1 }}>{property.name}</Typography>
      <IconButton
        size='sm'
        variant='plain'
        color='danger'
        onClick={() => onRemove(index)}
      >
        <Delete />
      </IconButton>
    </Box>
  );
}

SortablePropertyItem.propTypes = {
  property: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default function CombinedPropertiesSection({
  entity,
  combinedProperties,
  setCombinedProperties,
  componentId,
  columnId,
  setEditedItem,
}) {
  const [propertyOptions, setPropertyOptions] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const dispatch = useDispatch();
  const separator = useSelector(
    (state) => state.uiBuilder.columnSeparators[componentId]?.[columnId],
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (entity?.properties) {
      const properties = [];
      if (Array.isArray(entity.properties.properties)) {
        properties.push(
          ...entity.properties.properties.map((p) => ({
            name: p.Name || p.name,
            type: p.Type || p.type,
            isNavigation: false,
            ...p,
          })),
        );
      }
      if (Array.isArray(entity.properties.navigationProperties)) {
        properties.push(
          ...entity.properties.navigationProperties.map((p) => ({
            name: p.Name || p.name,
            type: p.Type || p.type,
            isNavigation: true,
            ...p,
          })),
        );
      }
      // Sort properties alphabetically by name
      const sortedProperties = properties.sort((a, b) =>
        a.name.localeCompare(b.name, 'de', { sensitivity: 'base' }),
      );
      setPropertyOptions(sortedProperties);
    } else {
      setPropertyOptions([]);
    }
  }, [entity?.properties]);

  const handleAddProperty = () => {
    if (selectedProperty) {
      setCombinedProperties([...combinedProperties, selectedProperty]);
      setSelectedProperty(null);
    }
  };

  const handleRemoveProperty = (index) => {
    const newProperties = [...combinedProperties];
    newProperties.splice(index, 1);
    setCombinedProperties(newProperties);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setCombinedProperties((items) => {
        const oldIndex = items.findIndex((item) => item.name === active.id);
        const newIndex = items.findIndex((item) => item.name === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className='space-y-4'>
      <FormControl>
        <FormLabel>Add Property</FormLabel>
        <div className='flex gap-2'>
          <Autocomplete
            value={selectedProperty}
            onChange={(_, value) => {
              setSelectedProperty(value);
              setEditedItem((prev) => ({
                ...prev,
                combinedProperties: [...combinedProperties, value],
              }));
            }}
            options={propertyOptions.filter(
              (prop) => !combinedProperties.some((p) => p.name === prop.name),
            )}
            getOptionLabel={(option) => option?.name || ''}
            placeholder='Select Property'
            sx={{ flex: 1 }}
          />
          <IconButton
            variant='solid'
            color='primary'
            onClick={handleAddProperty}
            disabled={!selectedProperty}
          >
            Add
          </IconButton>
        </div>
      </FormControl>

      <FormControl>
        <FormLabel>Separator</FormLabel>
        <Input
          value={separator || ''}
          onChange={(e) => {
            const newValue = e.target.value;
            dispatch(
              setColumnSeparator({
                componentId,
                columnId,
                separator: newValue || null,
              }),
            );
          }}
          placeholder='Enter separator (e.g. space, comma)'
          onKeyDown={(e) => {
            if (e.key === ' ') {
              e.stopPropagation();
            }
          }}
        />
      </FormControl>

      <div>
        <Typography level='body-sm' sx={{ mb: 1 }}>
          Properties Order
        </Typography>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={combinedProperties.map((p) => p.name)}
            strategy={verticalListSortingStrategy}
          >
            <div className='space-y-2'>
              {combinedProperties.map((property, index) => (
                <SortablePropertyItem
                  key={property.name}
                  property={property}
                  index={index}
                  onRemove={handleRemoveProperty}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {combinedProperties.length > 0 && (
        <Typography level='body-sm' color='neutral'>
          Preview:{' '}
          {combinedProperties
            .map((prop) => `{${prop.name}}`)
            .join(separator || '')}
        </Typography>
      )}
    </div>
  );
}

CombinedPropertiesSection.propTypes = {
  entity: PropTypes.shape({
    properties: PropTypes.shape({
      properties: PropTypes.array,
      navigationProperties: PropTypes.array,
    }),
  }).isRequired,
  combinedProperties: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      isNavigation: PropTypes.bool.isRequired,
    }),
  ).isRequired,
  setCombinedProperties: PropTypes.func.isRequired,
  componentId: PropTypes.string.isRequired,
  columnId: PropTypes.string.isRequired,
  setEditedItem: PropTypes.func.isRequired,
};

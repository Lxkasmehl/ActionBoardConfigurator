import PropTypes from 'prop-types';
import { useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FormControl,
  FormLabel,
  Input,
  Typography,
  Autocomplete,
} from '@mui/joy';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { setColumnSeparator } from '../../../../redux/uiBuilderSlice';
import NavigationPropertySelector from './NavigationPropertySelector';
import SortablePropertyItem from './SortablePropertyItem';

export default function CombinedPropertiesSection({
  entity,
  combinedProperties,
  setCombinedProperties,
  componentId,
  columnId,
}) {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [nestedNavigationPath, setNestedNavigationPath] = useState([]);
  const dispatch = useDispatch();
  const separator = useSelector(
    (state) => state.uiBuilder.columnSeparators[componentId]?.[columnId],
  );
  const allEntities = useSelector((state) => state.fetchedData.allEntities);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const propertyOptions = useMemo(() => {
    if (!entity?.properties) return [];

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
    return properties.sort((a, b) =>
      a.name.localeCompare(b.name, 'de', { sensitivity: 'base' }),
    );
  }, [entity?.properties]);

  const handlePropertyChange = useCallback(
    (_, value) => {
      if (!value) {
        setSelectedProperty(null);
        setNestedNavigationPath([]);
        return;
      }

      if (value.isNavigation) {
        setSelectedProperty(value);
        setNestedNavigationPath([value]);
      } else {
        setSelectedProperty(null);
        setCombinedProperties([
          ...combinedProperties,
          {
            nestedProperty: value,
            nestedNavigationPath: [],
          },
        ]);
      }
    },
    [combinedProperties, setCombinedProperties],
  );

  const handleNestedPropertyChange = useCallback(
    (property, path) => {
      const propertyWithPath = {
        nestedProperty: property,
        nestedNavigationPath: path,
      };
      setCombinedProperties([...combinedProperties, propertyWithPath]);
      setSelectedProperty(null);
      setNestedNavigationPath([]);
    },
    [combinedProperties, setCombinedProperties],
  );

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;

      if (active.id !== over.id) {
        setCombinedProperties((items) => {
          const getPropertyId = (item) => {
            if (item.nestedProperty) {
              return (
                item.nestedNavigationPath.map((p) => p.name).join('/') +
                '/' +
                item.nestedProperty.name
              );
            }
            return item.name;
          };

          const oldIndex = items.findIndex(
            (item) => getPropertyId(item) === active.id,
          );
          const newIndex = items.findIndex(
            (item) => getPropertyId(item) === over.id,
          );

          return arrayMove(items, oldIndex, newIndex);
        });
      }
    },
    [setCombinedProperties],
  );

  const handleSeparatorChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      dispatch(
        setColumnSeparator({
          componentId,
          columnId,
          separator: newValue || null,
        }),
      );
    },
    [dispatch, componentId, columnId],
  );

  const handleRemoveProperty = useCallback(
    (index) => {
      const newProperties = [...combinedProperties];
      newProperties.splice(index, 1);
      setCombinedProperties(newProperties);
    },
    [combinedProperties, setCombinedProperties],
  );

  const getPropertyKey = useCallback((property) => {
    if (
      property.nestedNavigationPath &&
      property.nestedNavigationPath.length > 0
    ) {
      return (
        property.nestedNavigationPath.map((p) => p.name).join('/') +
        '/' +
        property.nestedProperty.name
      );
    } else if (property.nestedProperty) {
      return property.nestedProperty.name;
    } else {
      return property.name;
    }
  }, []);

  return (
    <div className='space-y-4'>
      <FormControl>
        <FormLabel>Add Property</FormLabel>
        <Autocomplete
          value={selectedProperty}
          onChange={handlePropertyChange}
          options={propertyOptions}
          getOptionLabel={(option) => option?.name || ''}
          placeholder='Select Property'
          sx={{ width: '100%' }}
          groupBy={(option) => option?.name?.charAt(0)?.toUpperCase() || ''}
        />
      </FormControl>

      {selectedProperty?.isNavigation && (
        <NavigationPropertySelector
          entity={entity}
          property={selectedProperty}
          onPropertyChange={handleNestedPropertyChange}
          allEntities={allEntities}
          navigationPath={nestedNavigationPath}
          onPathChange={setNestedNavigationPath}
          componentId={componentId}
          columnId={columnId}
          selectorId={`${componentId}_${columnId}_${selectedProperty.name}`}
        />
      )}

      <FormControl>
        <FormLabel>Separator</FormLabel>
        <Input
          value={separator || ''}
          onChange={handleSeparatorChange}
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
            items={combinedProperties.filter(Boolean).map((p) => {
              if (p.nestedNavigationPath && p.nestedProperty) {
                return (
                  p.nestedNavigationPath.map((nav) => nav.name).join('/') +
                  '/' +
                  p.nestedProperty.name
                );
              } else {
                return p.name;
              }
            })}
            strategy={verticalListSortingStrategy}
          >
            <div className='space-y-2'>
              {combinedProperties.filter(Boolean).map((property, index) => (
                <SortablePropertyItem
                  key={getPropertyKey(property)}
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
            .filter(Boolean)
            .map((prop) => {
              if (
                prop.nestedNavigationPath &&
                prop.nestedNavigationPath.length > 0
              ) {
                return `{${prop.nestedNavigationPath.map((p) => p.name).join('/')}/${prop.nestedProperty.name}}`;
              } else if (prop.nestedProperty) {
                return `{${prop.nestedProperty.name}}`;
              } else {
                return `{${prop.name}}`;
              }
            })
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
};

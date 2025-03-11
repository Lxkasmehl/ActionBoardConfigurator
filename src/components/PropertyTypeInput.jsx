import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Input,
  Select,
  Option,
  Chip,
  Box,
  ChipDelete,
  Tooltip,
} from '@mui/joy';
import PropTypes from 'prop-types';
// import AddIcon from '@mui/icons-material/Add';
import { COMMON_INPUT_STYLES } from './PropertyTypeInput.constants';
import { useSelector } from 'react-redux';
import { useReactFlow } from '@xyflow/react';
import { useSendRequest } from '../hooks/useSendRequest';
import {
  valueMatchesType,
  formatValueByType,
  getBaseType,
  convertValueByType,
} from '../utils/entityUtils';

export default function PropertyTypeInput({
  propertyType,
  operator,
  propertyOptionsId,
  ...props
}) {
  const [inputValue, setInputValue] = useState('');
  const [values, setValues] = useState(() => {
    return props.value ? props.value.split(',').filter(Boolean) : [];
  });
  const [relatedSourceData, setRelatedSourceData] = useState([]);

  const config = useSelector((state) => state.entities.config);
  const propertiesBySection = useSelector(
    (state) => state.entities.propertiesBySection || {},
  );
  const { getEdges } = useReactFlow();

  // Get related source IDs and configs
  const relatedSourceInfo = useMemo(() => {
    if (!propertyOptionsId) return { relatedSourceIds: [], tempConfig: {} };

    const edges = getEdges();
    const relatedSourceIds = edges
      .filter((edge) => edge.target === propertyOptionsId)
      .map((edge) => edge.source);

    if (relatedSourceIds.length === 0)
      return { relatedSourceIds: [], tempConfig: {} };

    const tempConfig = {};
    relatedSourceIds.forEach((sourceId) => {
      if (config[sourceId]) {
        tempConfig[sourceId] = config[sourceId];
      }
    });

    return { relatedSourceIds, tempConfig };
  }, [propertyOptionsId, getEdges, config]);

  // Use the useSendRequest hook
  const sendRequest = useSendRequest(relatedSourceInfo.tempConfig);

  const fetchRelatedSourceData = useCallback(async () => {
    if (
      !propertyOptionsId ||
      Object.keys(relatedSourceInfo.tempConfig).length === 0
    )
      return;

    try {
      const results = await sendRequest();

      const flattenedData = results.flatMap((result, index) => {
        const sourceId = relatedSourceInfo.relatedSourceIds[index];
        const entityData = result.d.results;
        return entityData.map((item) => ({
          sourceId,
          ...item,
        }));
      });

      setRelatedSourceData(flattenedData);
    } catch (error) {
      console.error('Error fetching related source data:', error);
    }
  }, [propertyOptionsId, relatedSourceInfo, sendRequest]);

  useEffect(() => {
    fetchRelatedSourceData();
  }, [fetchRelatedSourceData]);

  const relatedSourceProperties = useMemo(() => {
    if (!propertyOptionsId) return [];

    return relatedSourceInfo.relatedSourceIds
      .flatMap((sourceId) =>
        (config[sourceId] ? Object.values(config[sourceId]) : []).flatMap(
          (entity) =>
            (entity.selectedProperties || []).map((propertyPath) => {
              if (!propertyPath.includes('/')) {
                return propertiesBySection[sourceId]['mainAutocomplete']?.find(
                  (prop) => prop.Name === propertyPath,
                );
              } else {
                const path = propertyPath.split('/').slice(0, -1).join('/');
                return propertiesBySection[sourceId][path]?.find(
                  (prop) => prop.Name === propertyPath,
                );
              }
            }),
        ),
      )
      .filter(Boolean);
  }, [
    propertyOptionsId,
    relatedSourceInfo.relatedSourceIds,
    config,
    propertiesBySection,
  ]);

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addValue(inputValue.trim());
    }
  };

  // const handleAddClick = () => {
  //   if (inputValue.trim()) {
  //     addValue(inputValue.trim());
  //   }
  // };

  const addValue = (value) => {
    const newValues = [...values, value];
    setValues(newValues);
    setInputValue('');
    props.onChange(newValues.join(','));
  };

  const handleDelete = (valueToDelete) => {
    const newValues = values.filter((value) => value !== valueToDelete);
    setValues(newValues);
    props.onChange(newValues.join(','));
  };

  const renderRelatedSourcePropertiesSelect = () => {
    if (relatedSourceProperties.length === 0) return null;

    const propertyValuesByType = {};

    relatedSourceProperties.forEach((prop) => {
      if (!prop) return;

      const propertyName = prop.Name;
      const propType = prop.Type || prop.type;
      const baseType = getBaseType(propType);

      if (!propertyValuesByType[baseType]) {
        propertyValuesByType[baseType] = [];
      }

      const values = relatedSourceData
        .filter((item) => {
          if (propertyName.includes('/')) {
            const parts = propertyName.split('/');
            let current = item;
            for (const part of parts) {
              if (!current || current[part] === undefined) return false;
              current = current[part];
            }
            return current !== undefined;
          }
          return item[propertyName] !== undefined;
        })
        .map((item) => {
          if (propertyName.includes('/')) {
            const parts = propertyName.split('/');
            let value = item;
            for (const part of parts) {
              value = value[part];
            }
            return { value, propertyName, propType };
          }
          return { value: item[propertyName], propertyName, propType };
        })
        .filter((item) => item.value !== null && item.value !== undefined);

      propertyValuesByType[baseType].push(...values);
    });

    const currentBaseType = getBaseType(propertyType);
    const filteredValues =
      propertyValuesByType[currentBaseType]?.filter((item) =>
        valueMatchesType(item.value, propertyType),
      ) || [];

    const uniqueValues = [];
    const seen = new Set();

    filteredValues.forEach((item) => {
      const valueStr = String(item.value);
      if (!seen.has(valueStr)) {
        seen.add(valueStr);
        uniqueValues.push(item);
      }
    });

    // Sort values if there are any
    if (uniqueValues.length > 0) {
      uniqueValues.sort((a, b) => {
        if (currentBaseType === 'date') {
          const aValue = String(a.value);
          const bValue = String(b.value);

          if (aValue.startsWith('/Date(') && bValue.startsWith('/Date(')) {
            const aTimestamp = parseInt(
              aValue.substring(6, aValue.length - 2).split('+')[0],
              10,
            );
            const bTimestamp = parseInt(
              bValue.substring(6, bValue.length - 2).split('+')[0],
              10,
            );
            return aTimestamp - bTimestamp;
          }
        }

        if (currentBaseType === 'number') {
          return parseFloat(a.value) - parseFloat(b.value);
        }

        return String(a.value).localeCompare(String(b.value));
      });
    }

    // Determine if the select should be disabled
    const isDisabled = uniqueValues.length === 0;

    // Create tooltip text based on the state
    const tooltipText = isDisabled
      ? `No values of type '${propertyType}' found in related sources`
      : `Showing only values that match type '${propertyType}'`;

    return (
      <Tooltip title={tooltipText} placement='top'>
        <span>
          <Select
            variant='plain'
            onChange={(e, newValue) => {
              if (newValue) {
                const convertedValue = convertValueByType(
                  newValue,
                  propertyType,
                );

                if (operator === 'IN') {
                  const newValues = [...values, convertedValue];
                  setValues(newValues);
                  props.onChange(newValues.join(','));
                } else {
                  props.onChange(convertedValue);
                }
              }
            }}
            value={null}
            disabled={isDisabled}
            sx={{
              borderRadius: 0,
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
            slotProps={{
              listbox: {
                placement: 'bottom-end',
                sx: { maxHeight: '300px', overflow: 'auto' },
              },
            }}
          >
            {isDisabled ? (
              <Option disabled value=''>
                No matching values
              </Option>
            ) : (
              uniqueValues.map((item, index) => (
                <Tooltip
                  key={`value-${index}`}
                  title={`From: ${item.propertyName}`}
                  placement='left'
                >
                  <Option value={item.value}>
                    &nbsp;&nbsp;{formatValueByType(item.value, propertyType)}
                  </Option>
                </Tooltip>
              ))
            )}
          </Select>
        </span>
      </Tooltip>
    );
  };

  const getInputType = () => {
    if (!propertyType || typeof propertyType !== 'string') {
      return 'text';
    }

    const typeMatch = propertyType.match(/Edm\.(.*)/);
    const type = (typeMatch ? typeMatch[1] : propertyType).toLowerCase();

    switch (type) {
      case 'datetimeoffset':
      case 'date':
        return 'datetime-local';
      case 'int16':
      case 'int32':
      case 'int64':
      case 'decimal':
      case 'double':
      case 'single':
        return 'number';
      case 'boolean':
        return 'boolean';
      default:
        return 'text';
    }
  };

  const inputType = getInputType();

  const initialValue = useMemo(() => {
    if (
      inputType === 'datetime-local' &&
      props.value &&
      typeof props.value === 'string' &&
      props.value.startsWith('/Date(')
    ) {
      return convertValueByType(props.value, propertyType);
    }
    return props.value;
  }, [inputType, props.value, propertyType]);

  if (operator === 'IN') {
    return (
      <Box>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder='Type and press Enter'
          sx={{ flex: 1, borderRadius: 0, width: 250, height: '36px' }}
          endDecorator={
            <>
              {/* <IconButton onClick={handleAddClick} sx={{ alignSelf: 'center' }}>
                <AddIcon />
              </IconButton> */}
              {renderRelatedSourcePropertiesSelect()}
            </>
          }
          startDecorator={
            values.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.5,
                  paddingTop: 0.5,
                  paddingBottom: 0.5,
                  maxWidth: 120,
                }}
              >
                {values.map((value, index) => {
                  const displayValue =
                    typeof value === 'string' && value.startsWith('/Date(')
                      ? formatValueByType(value, propertyType)
                      : value;

                  return (
                    <Chip
                      size='sm'
                      key={index}
                      variant='soft'
                      endDecorator={
                        <ChipDelete
                          onDelete={() => {
                            handleDelete(value);
                          }}
                        />
                      }
                    >
                      {displayValue}
                    </Chip>
                  );
                })}
              </Box>
            )
          }
        />
        <input type='hidden' name={props.name} value={values.join(',')} />
      </Box>
    );
  }

  if (inputType === 'boolean') {
    return (
      <>
        {renderRelatedSourcePropertiesSelect()}
        <Select sx={COMMON_INPUT_STYLES} {...props}>
          <Option value='true'>True</Option>
          <Option value='false'>False</Option>
        </Select>
      </>
    );
  }

  return (
    <>
      <Input
        type={inputType}
        sx={{ ...COMMON_INPUT_STYLES, paddingRight: 0 }}
        endDecorator={<>{renderRelatedSourcePropertiesSelect()}</>}
        {...props}
        value={initialValue || ''}
      />
    </>
  );
}

PropertyTypeInput.propTypes = {
  propertyType: PropTypes.string,
  operator: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  propertyOptionsId: PropTypes.number,
  fieldIdentifierId: PropTypes.string,
};

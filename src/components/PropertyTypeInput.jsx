import { useState } from 'react';
import { Input, Select, Option, Chip, Box, ChipDelete } from '@mui/joy';
import PropTypes from 'prop-types';
// import AddIcon from '@mui/icons-material/Add';
import { COMMON_INPUT_STYLES } from './PropertyTypeInput.constants';
import { useSelector } from 'react-redux';
import { useReactFlow } from '@xyflow/react';
import React from 'react';

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

  const config = useSelector((state) => state.entities.config);
  const propertiesBySection = useSelector(
    (state) => state.entities.propertiesBySection || {},
  );
  const { getEdges } = useReactFlow();

  const relatedSourceProperties = React.useMemo(() => {
    if (!propertyOptionsId) return [];

    const edges = getEdges();
    const relatedSourceIds = edges
      .filter((edge) => edge.target === propertyOptionsId)
      .map((edge) => edge.source);

    return relatedSourceIds
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
  }, [propertyOptionsId, getEdges, config, propertiesBySection]);

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

    return (
      <Select
        variant='plain'
        onChange={(e, newValue) => {
          if (newValue) {
            if (operator === 'IN') {
              const newValues = [...values, newValue];
              setValues(newValues);
              props.onChange(newValues.join(','));
            } else {
              props.onChange(newValue);
            }
          }
        }}
        value={null}
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
          },
        }}
      >
        {relatedSourceProperties.map((prop) => (
          <Option key={prop.Name} value={prop.Name}>
            {prop.Name}
          </Option>
        ))}
      </Select>
    );
  };

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
                {values.map((value, index) => (
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
                    {value}
                  </Chip>
                ))}
              </Box>
            )
          }
        />
        <input type='hidden' name={props.name} value={values.join(',')} />
      </Box>
    );
  }

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

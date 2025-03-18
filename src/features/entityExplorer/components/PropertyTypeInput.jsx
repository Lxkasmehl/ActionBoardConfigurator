import { useState, useMemo } from 'react';
import { Input, Select, Option, Box } from '@mui/joy';
import PropTypes from 'prop-types';
import { COMMON_INPUT_STYLES } from './PropertyTypeInput.constants';
import ValueChips from './ValueChips';
import RelatedSourceSelect from './RelatedSourceSelect';
import { typeUtils } from '../utils/entity/entityOperations';

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

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addValue(inputValue.trim());
    }
  };

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

  const handleRelatedSourceChange = (value, currentOperator) => {
    if (currentOperator === 'IN') {
      const newValues = [...values, value];
      setValues(newValues);
      props.onChange(newValues.join(','));
    } else {
      props.onChange(value);
    }
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
      return typeUtils.convertValue(props.value, propertyType);
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
            <RelatedSourceSelect
              propertyType={propertyType}
              propertyOptionsId={propertyOptionsId}
              onChange={handleRelatedSourceChange}
              operator={operator}
            />
          }
          startDecorator={
            <ValueChips
              values={values}
              propertyType={propertyType}
              onDelete={handleDelete}
            />
          }
        />
        <input type='hidden' name={props.name} value={values.join(',')} />
      </Box>
    );
  }

  if (inputType === 'boolean') {
    return (
      <>
        <RelatedSourceSelect
          propertyType={propertyType}
          propertyOptionsId={propertyOptionsId}
          onChange={handleRelatedSourceChange}
          operator={operator}
        />
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
        endDecorator={
          <RelatedSourceSelect
            propertyType={propertyType}
            propertyOptionsId={propertyOptionsId}
            onChange={handleRelatedSourceChange}
            operator={operator}
          />
        }
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

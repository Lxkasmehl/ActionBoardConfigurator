import { Autocomplete, Select, Option, Card, Typography } from '@mui/joy';
import PropTypes from 'prop-types';
import {
  OPERATOR_OPTIONS,
  AUTOCOMPLETE_STYLES,
  SELECT_STYLES,
} from './dropdownsAndInput.constants';
import PropertyTypeInput from './PropertyTypeInput';
import useDropdownsAndInputState from '../hooks/useDropdownsAndInputState';

export default function DropdownsAndInput({
  propertyOptionsId,
  fieldIdentifierId,
  ...props
}) {
  const {
    state,
    handleValueChange,
    handlePropertyChange,
    combinedOptions,
    dispatch,
  } = useDropdownsAndInputState(propertyOptionsId, fieldIdentifierId);

  const commonAutocompleteProps = {
    placeholder: 'Property',
    required: true,
    getOptionLabel: (option) => (option ? option.Name || '' : ''),
    onChange: handlePropertyChange,
    name: `property_${fieldIdentifierId}`,
  };

  return (
    <>
      <input
        type='hidden'
        name={`matchingEntityObject_${fieldIdentifierId}`}
        value={
          state.matchingEntityObjectState
            ? JSON.stringify(state.matchingEntityObjectState)
            : ''
        }
      />
      <input
        type='hidden'
        name={`fullPath_${fieldIdentifierId}`}
        defaultValue={
          state.matchingEntityObjectState
            ? state.matchingEntityObjectState.path
            : state.property?.Name || ''
        }
      />

      {Object.keys(state.matchingEntityObjectState?.matchingEntity || {})
        .length > 0 && (
        <Card
          sx={{
            height: '36px',
            padding: '0px 12px',
            display: 'flex',
            justifyContent: 'center',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          <Typography>{`${state.partialPath}/`}</Typography>
        </Card>
      )}

      <Autocomplete
        {...commonAutocompleteProps}
        key={state.autocompleteKey}
        options={
          Object.keys(state.matchingEntityObjectState?.matchingEntity || {})
            .length > 0
            ? (() => {
                const options = [
                  ...Object.values(
                    state.matchingEntityObjectState.matchingEntity?.properties
                      ?.properties || {},
                  ).flat(),
                  ...Object.values(
                    state.matchingEntityObjectState.matchingEntity?.properties
                      ?.navigationProperties || {},
                  ).flat(),
                ].sort((a, b) => a.Name.localeCompare(b.Name));
                return options;
              })()
            : combinedOptions.flatMap(({ group, options }) =>
                options.map((option) => ({
                  ...option,
                  group,
                  key: `${group}-${option.Name || option.type || Math.random()}`,
                })),
              )
        }
        value={state.property || null}
        groupBy={
          !state.matchingEntityObjectState
            ? (option) => option.group
            : undefined
        }
        isOptionEqualToValue={
          !state.matchingEntityObjectState
            ? (option, value) => option.Name === value?.Name
            : undefined
        }
        sx={{
          ...AUTOCOMPLETE_STYLES,
          ...(state.matchingEntityObjectState && {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }),
        }}
      />
      <Select
        name={`operator_${fieldIdentifierId}`}
        value={state.operator || ''}
        onChange={(e, newValue) =>
          dispatch({ type: 'SET_OPERATOR', payload: newValue })
        }
        required
        sx={SELECT_STYLES}
      >
        <Option value='' disabled>
          Operator
        </Option>
        {OPERATOR_OPTIONS.map((option) => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
      <PropertyTypeInput
        propertyType={state.property?.Type || state.property?.type}
        name={`value_${fieldIdentifierId}`}
        value={state.value}
        onChange={handleValueChange}
        placeholder='Enter a value'
        operator={state.operator}
        required
        {...props}
      />
    </>
  );
}

DropdownsAndInput.propTypes = {
  propertyOptionsId: PropTypes.number.isRequired,
  fieldIdentifierId: PropTypes.string.isRequired,
};

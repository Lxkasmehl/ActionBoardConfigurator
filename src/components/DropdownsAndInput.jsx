import { Autocomplete, Select, Option, Card, Typography } from '@mui/joy';
import PropTypes from 'prop-types';
import {
  OPERATOR_OPTIONS,
  AUTOCOMPLETE_STYLES,
  SELECT_STYLES,
} from './dropdownsAndInput.constants';
import PropertyTypeInput from './PropertyTypeInput';
import useDropdownsAndInputState from '../hooks/useDropdownsAndInputState';
import { useSelector } from 'react-redux';
import { sortProperties } from '../utils/entityUtils';

export default function DropdownsAndInput({
  propertyOptionsId,
  fieldIdentifierId,
  ...props
}) {
  const { state, handleValueChange, handlePropertyChange, localDispatch } =
    useDropdownsAndInputState(propertyOptionsId, fieldIdentifierId);
  const propertyOptions = useSelector(
    (state) => state.entities.propertyOptions[propertyOptionsId],
  );
  const sortedPropertyOptions = sortProperties(propertyOptions);

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
            ? [
                ...Object.values(
                  state.matchingEntityObjectState?.matchingEntity?.properties
                    ?.properties || {},
                )
                  .flat()
                  .filter((prop) => prop['sap:filterable'] === 'true'),
                ...Object.values(
                  state.matchingEntityObjectState?.matchingEntity?.properties
                    ?.navigationProperties || {},
                )
                  .flat()
                  .filter((prop) => prop['sap:filterable'] === 'true'),
              ].sort((a, b) => a.Name.localeCompare(b.Name))
            : // : combinedOptions.flatMap(({ group, options }) =>
              //     options
              //       .filter((prop) => prop['sap:filterable'] === 'true')
              //       .map((option) => ({
              //         ...option,
              //         group,
              //         key: `${group}-${option.Name || option.type || Math.random()}`,
              //       })),
              //   )
              sortedPropertyOptions.filter(
                (prop) => prop['sap:filterable'] === 'true',
              )
        }
        value={state.property || null}
        groupBy={(option) => option.Name?.[0]?.toUpperCase() || 'Other'}
        isOptionEqualToValue={(option, value) => option.Name === value?.Name}
        sx={{
          ...AUTOCOMPLETE_STYLES,
          ...(state.matchingEntityObjectState?.matchingEntity && {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }),
        }}
      />
      <Select
        data-testid='property-type-dropdown'
        name={`operator_${fieldIdentifierId}`}
        value={state.operator || ''}
        onChange={(e, newValue) =>
          localDispatch({ type: 'SET_OPERATOR', payload: newValue })
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
        propertyOptionsId={propertyOptionsId}
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

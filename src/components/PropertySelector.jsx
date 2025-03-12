import { Autocomplete, Tooltip } from '@mui/joy';
import PropTypes from 'prop-types';

function PropertySelector({ selectedOptions, disabled, ...props }) {
  return (
    <div>
      <Tooltip
        title={
          disabled
            ? 'Select an entity first'
            : 'Select all properties you want to display. If no properties are selected, all properties will be displayed.'
        }
        placement='top'
        variant='solid'
        sx={{ maxWidth: 300, whiteSpace: 'normal' }}
      >
        <span>
          <Autocomplete
            data-testid='property-selector'
            {...props}
            multiple
            disableCloseOnSelect
            isOptionEqualToValue={(option, value) =>
              option.Name === value?.Name
            }
            value={selectedOptions}
          />
        </span>
      </Tooltip>
    </div>
  );
}

PropertySelector.propTypes = {
  selectedOptions: PropTypes.array.isRequired,
  disabled: PropTypes.bool,
};

export default PropertySelector;

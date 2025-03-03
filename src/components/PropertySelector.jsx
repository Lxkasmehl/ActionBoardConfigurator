import { Autocomplete, Checkbox, Tooltip } from '@mui/joy';
import PropTypes from 'prop-types';

function PropertySelector({
  options,
  selectedOptions,
  onChange,
  onSelectAllChange,
  isChecked,
  label,
  placeholder,
  groupBy,
  getOptionLabel,
  limitTags,
  disabled,
  sx,
}) {
  return (
    <div>
      <Tooltip
        title={
          disabled
            ? 'Select an entity first'
            : isChecked
              ? 'You can not deselect individual properties if you selected all properties. Uncheck the Checkbox to select individual properties'
              : label
        }
        placement='top'
        variant='solid'
        sx={{ maxWidth: 300, whiteSpace: 'normal' }}
      >
        <span>
          <Autocomplete
            options={options}
            groupBy={groupBy}
            getOptionLabel={getOptionLabel}
            placeholder={placeholder}
            onChange={onChange}
            multiple
            disableCloseOnSelect
            isOptionEqualToValue={(option, value) =>
              option.Name === value?.Name
            }
            value={selectedOptions}
            limitTags={limitTags}
            sx={sx}
            disabled={isChecked || disabled}
          />
        </span>
      </Tooltip>
      <Checkbox
        label='Select All'
        variant='outlined'
        checked={isChecked}
        onChange={onSelectAllChange}
        disabled={disabled}
        sx={{ marginTop: 1, marginLeft: 1, alignSelf: 'start' }}
      />
    </div>
  );
}

PropertySelector.propTypes = {
  options: PropTypes.array.isRequired,
  selectedOptions: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  onSelectAllChange: PropTypes.func.isRequired,
  isChecked: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  groupBy: PropTypes.func.isRequired,
  getOptionLabel: PropTypes.func.isRequired,
  limitTags: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  sx: PropTypes.object,
};

export default PropertySelector;

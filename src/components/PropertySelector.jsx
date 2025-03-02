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
  sx,
}) {
  return (
    <div>
      <Tooltip title={label} placement='top' variant='solid'>
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
          />
        </span>
      </Tooltip>
      <Checkbox
        label='Select All'
        variant='outlined'
        checked={isChecked}
        onChange={onSelectAllChange}
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
  sx: PropTypes.object,
};

export default PropertySelector;

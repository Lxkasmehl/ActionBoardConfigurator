import { Select, Option, Typography, Tooltip } from '@mui/joy';
import PropTypes from 'prop-types';

export default function LogicSelector({
  value,
  onChange,
  disabled,
  name,
  showWhere,
}) {
  return showWhere ? (
    <Typography sx={{ mr: 8.3 }}>Where</Typography>
  ) : (
    <Tooltip
      title={
        disabled
          ? 'The first dropdown controls the selection of all dropdowns'
          : ''
      }
      placement='bottom'
    >
      <div className='h-fit'>
        <Select
          sx={{ width: 90, mr: 3, height: 'fit-content' }}
          value={value}
          onChange={onChange}
          required
          disabled={disabled}
          name={name}
        >
          <Option value='and'>AND</Option>
          <Option value='or'>OR</Option>
        </Select>
      </div>
    </Tooltip>
  );
}

LogicSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  name: PropTypes.string,
  showWhere: PropTypes.bool.isRequired,
};

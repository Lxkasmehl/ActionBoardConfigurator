import { Select, Option, Typography, Tooltip } from '@mui/joy';
import PropTypes from 'prop-types';
import { useLogic } from '../hooks/useLogic';

export default function LogicSelector({
  disabled,
  name,
  showWhere,
  isSubCondition,
  id,
  groupIndex,
}) {
  const {
    selectedLogic,
    selectedSubLogic,
    handleLogicChange,
    handleSubLogicChange,
  } = useLogic(id, groupIndex);

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
      <div style={{ height: 'fit-content' }}>
        <Select
          data-testid={'logic-selector'}
          sx={{ width: 90, mr: 3, height: 'fit-content' }}
          value={isSubCondition ? selectedSubLogic : selectedLogic}
          onChange={isSubCondition ? handleSubLogicChange : handleLogicChange}
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
  disabled: PropTypes.bool.isRequired,
  name: PropTypes.string,
  showWhere: PropTypes.bool.isRequired,
  isSubCondition: PropTypes.bool.isRequired,
  id: PropTypes.number.isRequired,
  groupIndex: PropTypes.number,
};

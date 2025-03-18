import { Select, Option, Tooltip } from '@mui/joy';
import PropTypes from 'prop-types';
import { convertValueByType, formatValueByType } from '../utils/entityUtils';
import useRelatedSourceData from '../hooks/useRelatedSourceData';

export default function RelatedSourceSelect({
  propertyType,
  propertyOptionsId,
  onChange,
  operator,
}) {
  const { processedValues } = useRelatedSourceData(
    propertyOptionsId,
    propertyType,
  );

  const isDisabled = processedValues.length === 0;

  const tooltipText = isDisabled
    ? `No values of type '${propertyType}' found in related sources`
    : `Showing only values that match type '${propertyType}'`;

  const handleChange = (e, newValue) => {
    if (newValue) {
      const convertedValue = convertValueByType(newValue, propertyType);
      onChange(convertedValue, operator);
    }
  };

  return (
    <Tooltip title={tooltipText} placement='top'>
      <span>
        <Select
          data-testid='related-source-select'
          variant='plain'
          onChange={handleChange}
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
            processedValues.map((item, index) => (
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
}

RelatedSourceSelect.propTypes = {
  propertyType: PropTypes.string.isRequired,
  propertyOptionsId: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  operator: PropTypes.string.isRequired,
};

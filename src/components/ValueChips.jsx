import { Box, Chip, ChipDelete } from '@mui/joy';
import PropTypes from 'prop-types';
import { formatValueByType } from '../utils/entityUtils';

export default function ValueChips({ values, propertyType, onDelete }) {
  if (values.length === 0) return null;

  return (
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
      {values.map((value, index) => {
        const displayValue =
          typeof value === 'string' && value.startsWith('/Date(')
            ? formatValueByType(value, propertyType)
            : value;

        return (
          <Chip
            size='sm'
            key={index}
            variant='soft'
            endDecorator={
              <ChipDelete
                onDelete={() => {
                  onDelete(value);
                }}
              />
            }
          >
            {displayValue}
          </Chip>
        );
      })}
    </Box>
  );
}

ValueChips.propTypes = {
  values: PropTypes.array.isRequired,
  propertyType: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
};

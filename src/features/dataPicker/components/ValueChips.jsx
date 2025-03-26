import { Box, Chip, ChipDelete } from '@mui/joy';
import PropTypes from 'prop-types';
import { typeUtils } from '../../../shared/utils/entityOperations';

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
        const formattedValue = typeUtils.formatValue(value, propertyType);

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
            {formattedValue}
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

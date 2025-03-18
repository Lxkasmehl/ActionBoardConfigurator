import PropTypes from 'prop-types';
import { Box } from '@mui/joy';
import SortableComponent from './SortableComponent';

export const DragOverlayComponent = ({ activeDragData }) => {
  if (!activeDragData) return null;

  return (
    <Box
      sx={{
        transform: 'scale(1.02)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease',
      }}
    >
      <SortableComponent component={activeDragData.component} />
    </Box>
  );
};

DragOverlayComponent.propTypes = {
  activeDragData: PropTypes.shape({
    type: PropTypes.oneOf(['library', 'preview']).isRequired,
    component: PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      props: PropTypes.object.isRequired,
    }).isRequired,
  }),
};

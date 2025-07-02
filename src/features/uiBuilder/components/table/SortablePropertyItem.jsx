import PropTypes from 'prop-types';
import { Typography, IconButton, Box } from '@mui/joy';
import { DragIndicator, Delete } from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortablePropertyItem({ property, index, onRemove }) {
  const getPropertyId = (item) => {
    if (item.nestedNavigationPath && item.nestedNavigationPath.length > 0) {
      return (
        item.nestedNavigationPath.map((p) => p.name).join('/') +
        '/' +
        item.nestedProperty.name
      );
    } else if (item.nestedProperty) {
      return item.nestedProperty.name;
    } else {
      return item.name;
    }
  };

  const id = getPropertyId(property);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const displayName = getPropertyId(property);

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
      }}
    >
      <div {...attributes} {...listeners}>
        <DragIndicator />
      </div>
      <Typography sx={{ flex: 1 }}>{displayName}</Typography>
      <IconButton
        size='sm'
        variant='plain'
        color='danger'
        onClick={() => onRemove(index)}
      >
        <Delete />
      </IconButton>
    </Box>
  );
}

SortablePropertyItem.propTypes = {
  property: PropTypes.shape({
    name: PropTypes.string.isRequired,
    nestedNavigationPath: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
      }),
    ).isRequired,
    nestedProperty: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default SortablePropertyItem;

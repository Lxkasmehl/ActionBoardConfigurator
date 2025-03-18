import { Box, Card, Typography } from '@mui/joy';
import PropTypes from 'prop-types';
import { useDroppable } from '@dnd-kit/core';
import SortableComponent from './SortableComponent';
import EmptyState from './EmptyState';

const BORDER_STYLES = {
  DASHED: '2px dashed',
  NONE: 'none',
};

const getContainerStyles = (hasComponents, isOver) => ({
  height: '100%',
  p: 2,
  border: hasComponents && isOver ? BORDER_STYLES.DASHED : BORDER_STYLES.NONE,
  borderColor: hasComponents && isOver ? 'primary.500' : BORDER_STYLES.NONE,
  borderRadius: 'sm',
});

export default function PreviewArea({ components }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'preview-area',
    data: { type: 'preview-area' },
  });

  return (
    <Card
      sx={{
        flex: 1,
        height: '100%',
        overflowY: 'auto',
        p: 2,
        transition: 'background-color 0.2s ease',
      }}
    >
      <Typography level='h4' mb={2}>
        Preview
      </Typography>

      <Box
        ref={setNodeRef}
        sx={getContainerStyles(components.length > 0, isOver)}
      >
        {components.length === 0 ? (
          <EmptyState isOver={isOver} />
        ) : (
          components.map((component) => (
            <SortableComponent key={component.id} component={component} />
          ))
        )}
      </Box>
    </Card>
  );
}

PreviewArea.propTypes = {
  components: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      props: PropTypes.object,
    }),
  ).isRequired,
};

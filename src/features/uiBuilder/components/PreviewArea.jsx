import { Box, Card, Typography } from '@mui/joy';
import PropTypes from 'prop-types';
import { useDroppable } from '@dnd-kit/core';
import SortableComponent from './SortableComponent';
import EmptyState from './EmptyState';
import TrashBin from './TrashBin';

const BORDER_STYLES = {
  DASHED: '2px dashed',
  NONE: 'none',
};

const getContainerStyles = (hasComponents, isOver) => ({
  height: '100%',
  p: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  border: hasComponents && isOver ? BORDER_STYLES.DASHED : BORDER_STYLES.NONE,
  borderColor: hasComponents && isOver ? 'primary.500' : BORDER_STYLES.NONE,
  borderRadius: 'sm',
  position: 'relative',
});

export default function PreviewArea({
  components,
  activeDragData,
  onTrashOver,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'preview-area',
    data: { type: 'preview-area' },
  });

  const isDraggingExistingComponent = activeDragData?.type === 'preview';

  return (
    <Card
      sx={{
        flex: 1,
        height: '100%',
        overflowY: 'auto',
        p: 2,
        transition: 'background-color 0.2s ease',
        position: 'relative',
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
        <TrashBin
          isVisible={isDraggingExistingComponent}
          onOverChange={onTrashOver}
        />
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
  activeDragData: PropTypes.shape({
    type: PropTypes.oneOf(['library', 'preview']),
    component: PropTypes.object,
  }),
  onTrashOver: PropTypes.func.isRequired,
};

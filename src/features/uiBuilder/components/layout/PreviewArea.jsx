import { Box, Card, Typography } from '@mui/joy';
import PropTypes from 'prop-types';
import { useDroppable } from '@dnd-kit/core';
import SortableComponent from '../dragAndDrop/SortableComponent';
import EmptyState from '../layout/EmptyState';
import TrashBin from './TrashBin';

export default function PreviewArea({
  components,
  activeDragData,
  onTrashOver,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'preview-area',
    data: { type: 'preview-area' },
  });

  const { setNodeRef: setInitialGapRef, isOver: isInitialGapOver } =
    useDroppable({
      id: 'initial-gap',
      data: {
        type: 'gap',
        componentId: components[0]?.id,
      },
    });

  const isDraggingExistingComponent = activeDragData?.type === 'preview';

  return (
    <Card
      sx={{
        flex: 1,
        height: '100%',
        p: 2,
        transition: 'background-color 0.2s ease',
        position: 'relative',
      }}
    >
      <Typography level='h4' mb={2}>
        Preview
      </Typography>

      <Box
        id='preview-area'
        ref={setNodeRef}
        sx={{
          height: '100%',
          pt: 0,
          px: 2,
          pb: 2,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'sm',
          position: 'relative',
          overflowY: 'auto',
        }}
      >
        {components.length === 0 ? (
          <EmptyState isOver={isOver} />
        ) : (
          <>
            <Box
              ref={setInitialGapRef}
              sx={{
                height: '16px',
                width: '100%',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '50%',
                  height: '2px',
                  backgroundColor: isInitialGapOver
                    ? 'primary.500'
                    : 'transparent',
                  transition: 'background-color 0.2s ease',
                },
              }}
            />
            {components.map((component, index) => (
              <SortableComponent
                key={component.id}
                component={component}
                isOver={isOver}
                isLast={index === components.length - 1}
              />
            ))}
          </>
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

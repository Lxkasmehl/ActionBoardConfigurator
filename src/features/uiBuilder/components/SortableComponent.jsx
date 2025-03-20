import { useSortable } from '@dnd-kit/sortable';
import { Box, Card, Typography, Button } from '@mui/joy';
import PropTypes from 'prop-types';
import { COMPONENT_CONFIGS } from './constants';
import FilterArea from './FilterArea';

export default function SortableComponent({ component }) {
  const { attributes, listeners, setNodeRef, transition, isDragging, isOver } =
    useSortable({
      id: component.id,
      data: {
        isDragging: false,
      },
    });

  const style = {
    transition,
    position: 'relative',
    zIndex: isDragging ? 1 : 0,
  };

  const renderComponent = () => {
    const config = COMPONENT_CONFIGS[component.type];
    if (!config) return null;

    switch (component.type) {
      case 'heading':
        return (
          <Typography level={component.props.level || 'h2'}>
            {component.props.text}
          </Typography>
        );
      case 'paragraph':
        return <Typography>{component.props.text}</Typography>;
      case 'button':
        return (
          <Button
            variant={component.props.variant}
            color={component.props.color}
          >
            {component.props.text}
          </Button>
        );
      case 'image':
        return (
          <Box
            component='img'
            src={component.props.src}
            alt={component.props.alt}
            sx={{ maxWidth: '100%', height: 'auto' }}
          />
        );
      case 'filterArea':
        return <FilterArea />;
      default:
        return null;
    }
  };

  return (
    <>
      {isOver && (
        <Box
          sx={{
            height: '2px',
            backgroundColor: 'primary.500',
            width: '100%',
            my: 1,
          }}
        />
      )}
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        sx={{
          p: 2,
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing',
          },
          position: 'relative',
          transition: 'transform 0.2s ease',
        }}
      >
        {renderComponent()}
      </Card>
    </>
  );
}

SortableComponent.propTypes = {
  component: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    props: PropTypes.shape({
      text: PropTypes.string,
      level: PropTypes.string,
      variant: PropTypes.string,
      color: PropTypes.string,
      content: PropTypes.string,
      src: PropTypes.string,
      alt: PropTypes.string,
      fields: PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.string,
          label: PropTypes.string,
          placeholder: PropTypes.string,
        }),
      ),
    }),
  }).isRequired,
};

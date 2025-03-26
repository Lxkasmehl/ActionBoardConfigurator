import { useSortable } from '@dnd-kit/sortable';
import { Box, Card, Button, Divider } from '@mui/joy';
import PropTypes from 'prop-types';
import { COMPONENT_CONFIGS } from './constants';
import FilterArea from './FilterArea';
import { useDroppable } from '@dnd-kit/core';
import ButtonBar from './ButtonBar';
import TableComponent from './TableComponent';
import HeadingComponent from './HeadingComponent';
import ParagraphComponent from './ParagraphComponent';

export default function SortableComponent({ component, isOver, isLast }) {
  const { attributes, listeners, setNodeRef, transition, isDragging } =
    useSortable({
      id: component.id,
      data: {
        isDragging: false,
      },
    });

  const { setNodeRef: setGapRef, isOver: isGapOver } = useDroppable({
    id: `gap-${component.id}`,
    data: {
      type: 'gap',
      componentId: component.id,
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
        return <HeadingComponent component={component} />;
      case 'paragraph':
        return <ParagraphComponent component={component} />;
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
        return <FilterArea component={component} />;
      case 'buttonBar':
        return <ButtonBar component={component} />;
      case 'table':
        return <TableComponent component={component} />;
      default:
        return null;
    }
  };

  return (
    <>
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
      <Box
        ref={setGapRef}
        sx={{
          py: 1,
          position: 'relative',
        }}
      >
        <Divider
          sx={{
            backgroundColor:
              isGapOver || (isLast && isOver) ? 'primary.500' : 'transparent',
            transition: 'background-color 0.2s ease',
            height: '2px',
          }}
        />
      </Box>
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
  isOver: PropTypes.bool,
  isLast: PropTypes.bool,
};

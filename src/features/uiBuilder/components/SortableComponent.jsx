import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Card, Typography, Button, Stack } from '@mui/joy';
import PropTypes from 'prop-types';
import { COMPONENT_CONFIGS } from './constants';
import FilterArea from './FilterArea';

export default function SortableComponent({ component }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
      case 'card':
        return (
          <Card>
            <Typography>{component.props.content}</Typography>
          </Card>
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
      case 'form':
        return (
          <Stack spacing={2}>
            {component.props.fields.map((field, index) => (
              <Box key={index}>
                <Typography level='body-sm'>{field.label}</Typography>
                <Box
                  component='input'
                  type={field.type}
                  placeholder={field.placeholder}
                  sx={{
                    width: '100%',
                    p: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 'sm',
                  }}
                />
              </Box>
            ))}
          </Stack>
        );
      case 'filterArea':
        return <FilterArea />;
      default:
        return null;
    }
  };

  return (
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
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.2s ease',
      }}
    >
      {renderComponent()}
    </Card>
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

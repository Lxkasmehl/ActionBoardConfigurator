import { Box, Card, Typography, Stack } from '@mui/joy';
import PropTypes from 'prop-types';
import {
  Title,
  TextFields,
  SmartButton,
  Rectangle,
  Image,
  DynamicForm,
  FilterList,
  ViewSidebar,
  TableChart,
  Addchart,
} from '@mui/icons-material';
import { useDraggable } from '@dnd-kit/core';

function DraggableComponent({ type, config, index, disabled = false }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${type}-${index}`,
    data: { type },
    disabled: disabled,
  });

  const renderIcon = (iconName) => {
    const iconMap = {
      Title: <Title />,
      TextFields: <TextFields />,
      SmartButton: <SmartButton />,
      Rectangle: <Rectangle />,
      Image: <Image />,
      DynamicForm: <DynamicForm />,
      FilterList: <FilterList />,
      ViewSidebar: <ViewSidebar />,
      TableChart: <TableChart />,
      Addchart: <Addchart />,
    };
    return iconMap[iconName] || null;
  };

  return (
    <Card
      ref={setNodeRef}
      {...(disabled ? {} : { ...attributes, ...listeners })}
      sx={{
        p: 2,
        cursor: disabled ? 'not-allowed' : 'grab',
        '&:active': {
          cursor: disabled ? 'not-allowed' : 'grabbing',
        },
        opacity: isDragging ? 0.5 : disabled ? 0.5 : 1,
        '&:hover': {
          bgcolor: disabled ? 'background.level2' : 'background.level1',
        },
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.2s ease',
      }}
    >
      <Stack direction='row' spacing={2} alignItems='center'>
        <Box
          sx={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.level1',
            borderRadius: 'sm',
          }}
        >
          {renderIcon(config.icon)}
        </Box>
        <Typography sx={{ opacity: disabled ? 0.5 : 1 }}>
          {config.label}
        </Typography>
      </Stack>
    </Card>
  );
}

DraggableComponent.propTypes = {
  type: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
};

export default DraggableComponent;

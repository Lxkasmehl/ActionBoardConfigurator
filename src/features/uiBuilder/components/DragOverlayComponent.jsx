import PropTypes from 'prop-types';
import { Box } from '@mui/joy';
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
import { COMPONENT_CONFIGS } from './constants';

export const DragOverlayComponent = ({ activeDragData, isOverTrash }) => {
  if (!activeDragData) return null;

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

  const config = COMPONENT_CONFIGS[activeDragData.component.type];
  if (!config) return null;

  return (
    <Box
      sx={{
        transform: isOverTrash
          ? 'translate(-50%, -50%) scale(0.9)'
          : 'translate(-50%, -50%) scale(1)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
        borderRadius: 'sm',
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: isOverTrash ? 'danger.400' : 'background.level1',
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {renderIcon(config.icon)}
    </Box>
  );
};

DragOverlayComponent.propTypes = {
  activeDragData: PropTypes.shape({
    type: PropTypes.oneOf(['library', 'preview']).isRequired,
    component: PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      props: PropTypes.object,
    }).isRequired,
  }),
  isOverTrash: PropTypes.bool.isRequired,
};

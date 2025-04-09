import { useSortable } from '@dnd-kit/sortable';
import { Box, Card, Button, Divider } from '@mui/joy';
import PropTypes from 'prop-types';
import { COMPONENT_CONFIGS } from '../common/constants';
import FilterArea from '../FilterArea';
import { useDroppable } from '@dnd-kit/core';
import ButtonBar from '../ButtonBar';
import TableComponent from '../table/TableComponent';
import HeadingComponent from '../text/HeadingComponent';
import ParagraphComponent from '../text/ParagraphComponent';
import ChartComponent from '../chart/ChartComponent';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setWorkingSelectedComponents } from '@/redux/uiBuilderSlice';

export default function SortableComponent({ component, isOver, isLast }) {
  const [isNearEdge, setIsNearEdge] = useState(false);
  const dispatch = useDispatch();
  const workingSelectedComponents = useSelector(
    (state) => state.uiBuilder.workingSelectedComponents,
  );
  const isSelected = workingSelectedComponents.includes(component.id);
  const isInGroupMode = useSelector((state) => state.uiBuilder.isInGroupMode);

  const { attributes, listeners, setNodeRef, transition, isDragging } =
    useSortable({
      id: component.id,
      data: {
        isDragging: false,
      },
      disabled: isInGroupMode,
    });

  const { setNodeRef: setGapRef, isOver: isGapOver } = useDroppable({
    id: `gap-${component.id}`,
    data: {
      type: 'gap',
      componentId: component.id,
    },
    disabled: isInGroupMode,
  });

  const style = {
    transition,
    position: 'relative',
    zIndex: isDragging ? 1 : 0,
  };

  const handleMouseMove = (e) => {
    if (component.type !== 'table') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const edgeThreshold = 20; // pixels from edge

    setIsNearEdge(
      x < edgeThreshold ||
        x > rect.width - edgeThreshold ||
        y < edgeThreshold ||
        y > rect.height - edgeThreshold,
    );
  };

  const toggleComponentSelection = () => {
    const newSelectedComponents = workingSelectedComponents.includes(
      component.id,
    )
      ? workingSelectedComponents.filter((id) => id !== component.id)
      : [...workingSelectedComponents, component.id];
    dispatch(setWorkingSelectedComponents(newSelectedComponents));
  };

  const handleClick = () => {
    if (isInGroupMode) {
      toggleComponentSelection();
    }
  };

  const renderComponent = () => {
    const config = COMPONENT_CONFIGS[component.type];
    if (!config) return null;

    const commonProps = {
      disabled: isInGroupMode,
      sx: isInGroupMode ? { pointerEvents: 'none', opacity: 0.7 } : {},
    };

    switch (component.type) {
      case 'heading':
        return <HeadingComponent component={component} {...commonProps} />;
      case 'paragraph':
        return <ParagraphComponent component={component} {...commonProps} />;
      case 'button':
        return (
          <Button
            variant={component.props.variant}
            color={component.props.color}
            disabled={isInGroupMode}
            sx={isInGroupMode ? { opacity: 0.7 } : {}}
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
            sx={{
              maxWidth: '100%',
              height: 'auto',
              ...(isInGroupMode ? { opacity: 0.7 } : {}),
            }}
          />
        );
      case 'filterArea':
        return <FilterArea component={component} {...commonProps} />;
      case 'buttonBar':
        return <ButtonBar component={component} {...commonProps} />;
      case 'table':
        return <TableComponent component={component} {...commonProps} />;
      case 'chart':
        return <ChartComponent component={component} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        onMouseMove={component.type === 'table' ? handleMouseMove : undefined}
        onMouseLeave={
          component.type === 'table' ? () => setIsNearEdge(false) : undefined
        }
        onClick={handleClick}
        {...(component.type === 'table'
          ? isNearEdge
            ? { ...attributes, ...listeners }
            : {}
          : { ...attributes, ...listeners })}
        sx={{
          p: 2,
          cursor: isInGroupMode
            ? 'pointer'
            : component.type === 'table'
              ? isNearEdge
                ? 'grab'
                : 'default'
              : 'grab',
          '&:active': {
            cursor: isInGroupMode
              ? 'pointer'
              : component.type === 'table'
                ? isNearEdge
                  ? 'grabbing'
                  : 'default'
                : 'grabbing',
          },
          position: 'relative',
          transition: 'transform 0.2s ease',
          border: isSelected ? '2px solid' : '1px solid',
          borderColor: isSelected ? 'primary.500' : 'divider',
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

import { useSortable } from '@dnd-kit/sortable';
import { Box, Card, Button, Divider } from '@mui/joy';
import PropTypes from 'prop-types';
import { COMPONENT_CONFIGS } from '../common/constants';
import FilterArea from '../FilterArea';
import { useDroppable } from '@dnd-kit/core';
import ButtonBar from '../buttonBar/ButtonBar';
import TableComponent from '../table/TableComponent';
import HeadingComponent from '../text/HeadingComponent';
import ParagraphComponent from '../text/ParagraphComponent';
import ChartComponent from '../chart/ChartComponent';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setWorkingSelectedComponents } from '@/redux/uiBuilderSlice';
import ImageComponent from '../ImageComponent';
export default function SortableComponent({ component, isOver, isLast }) {
  const [isNearEdge, setIsNearEdge] = useState(false);
  const dispatch = useDispatch();
  const workingSelectedComponents = useSelector(
    (state) => state.uiBuilder.workingSelectedComponents,
  );
  const componentGroups = useSelector(
    (state) => state.uiBuilder.componentGroups,
  );
  const isWorkingSelected = workingSelectedComponents.includes(component.id);
  const isInCreateGroupMode = useSelector(
    (state) => state.uiBuilder.isInCreateGroupMode,
  );
  const groupToEdit = useSelector((state) => state.uiBuilder.groupToEdit);
  // Find which group this component belongs to
  const componentGroup = Object.values(componentGroups).find((group) =>
    group.components.includes(component.id),
  );
  const groupColor = componentGroup ? componentGroup.color : undefined;
  const groupIsEditing =
    groupToEdit ===
    Object.keys(componentGroups).find(
      (key) => componentGroups[key] === componentGroup,
    );

  const { attributes, listeners, setNodeRef, transition, isDragging } =
    useSortable({
      id: component.id,
      data: {
        isDragging: false,
      },
      disabled: isInCreateGroupMode || groupToEdit !== null,
    });

  const { setNodeRef: setGapRef, isOver: isGapOver } = useDroppable({
    id: `gap-${component.id}`,
    data: {
      type: 'gap',
      componentId: component.id,
    },
    disabled: isInCreateGroupMode || groupToEdit !== null,
  });

  const style = {
    transition,
    position: 'relative',
    zIndex: isDragging ? 1 : 0,
  };

  useEffect(() => {
    if (groupIsEditing) {
      dispatch(setWorkingSelectedComponents(componentGroup.components));
    }
  }, [dispatch, groupIsEditing, componentGroup]);

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
    if (isInCreateGroupMode || groupToEdit !== null) {
      toggleComponentSelection();
    }
  };

  const renderComponent = () => {
    const config = COMPONENT_CONFIGS[component.type];
    if (!config) return null;

    const commonProps = {
      disabled: isInCreateGroupMode || groupToEdit !== null,
      sx:
        isInCreateGroupMode || groupToEdit !== null
          ? { pointerEvents: 'none', opacity: 0.7 }
          : {},
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
            disabled={isInCreateGroupMode || groupToEdit !== null}
            sx={
              isInCreateGroupMode || groupToEdit !== null
                ? { opacity: 0.7 }
                : {}
            }
          >
            {component.props.text}
          </Button>
        );
      case 'image':
        return <ImageComponent component={component} {...commonProps} />;
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

  const isInGroupMode = isInCreateGroupMode || groupToEdit;
  const isTableComponent = component.type === 'table';
  const hasElevatedZIndex =
    (isInCreateGroupMode &&
      !componentGroup &&
      ['buttonBar', 'filterArea', 'table', 'chart'].includes(component.type)) ||
    (groupToEdit && !componentGroup) ||
    (groupToEdit && componentGroup && groupIsEditing);

  const cardStyles = {
    p: 2,
    position: 'relative',
    transition: 'transform 0.2s ease',
    border: isWorkingSelected || groupColor ? '2px solid' : '1px solid',
    borderColor: isInGroupMode
      ? isWorkingSelected
        ? groupColor || 'primary.500'
        : 'divider'
      : groupColor || 'divider',
    zIndex: hasElevatedZIndex ? '20 !important' : undefined,
  };

  const cursorStyles = {
    cursor: isInGroupMode
      ? 'pointer'
      : isTableComponent
        ? isNearEdge
          ? 'grab'
          : 'default'
        : 'grab',
    '&:active': {
      cursor: isInGroupMode
        ? 'pointer'
        : isTableComponent
          ? isNearEdge
            ? 'grabbing'
            : 'default'
          : 'grabbing',
    },
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        onMouseMove={isTableComponent ? handleMouseMove : undefined}
        onMouseLeave={isTableComponent ? () => setIsNearEdge(false) : undefined}
        onClick={handleClick}
        {...(isTableComponent
          ? isNearEdge
            ? { ...attributes, ...listeners }
            : {}
          : { ...attributes, ...listeners })}
        sx={{
          ...cardStyles,
          ...cursorStyles,
        }}
        data-testid={`sortable-component-${component.type}`}
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

import { useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Box } from '@mui/joy';
import ComponentLibrary from './ComponentLibrary';
import PreviewArea from './PreviewArea';
import { COMPONENT_CONFIGS } from './constants';
import SortableComponent from './SortableComponent';

const collisionDetectionStrategy = (args) => {
  const pointerCollisions = pointerWithin(args);

  if (pointerCollisions.length > 0) {
    const previewAreaCollision = pointerCollisions.find(
      (collision) => collision.id === 'preview-area',
    );

    if (previewAreaCollision) {
      return [previewAreaCollision];
    }
  }

  return rectIntersection(args);
};

export default function UiBuilder() {
  const [components, setComponents] = useState([]);
  const [activeDragData, setActiveDragData] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const createNewComponent = (componentType) => {
    const config = COMPONENT_CONFIGS[componentType];
    if (!config) return null;

    return {
      id: `component-${Date.now()}`,
      type: componentType,
      props: { ...config.defaultProps },
    };
  };

  const handleDragStart = (event) => {
    const { active } = event;
    if (active.id.includes('library-')) {
      const componentType = active.data.current.type;
      const newComponent = createNewComponent(componentType);
      setActiveDragData({ type: 'library', component: newComponent });
    } else if (active.id.startsWith('component-')) {
      const component = components.find((c) => c.id === active.id);
      if (component) {
        setActiveDragData({ type: 'preview', component });
      }
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragData(null);

    if (!over) return;

    if (active.id.startsWith('component-') && over.id === 'preview-area') {
      setComponents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      return;
    }

    if (active.id.includes('library-') && over.id === 'preview-area') {
      const componentType = active.data.current.type;
      const newComponent = createNewComponent(componentType);
      setComponents((prev) => [...prev, newComponent]);
    }
  };

  const renderDragOverlay = () => {
    if (!activeDragData) return null;

    if (activeDragData.type === 'library') {
      return (
        <Box
          sx={{
            transform: 'scale(1.02)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease',
          }}
        >
          <SortableComponent component={activeDragData.component} />
        </Box>
      );
    }

    if (activeDragData.type === 'preview') {
      return (
        <Box
          sx={{
            transform: 'scale(1.02)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease',
          }}
        >
          <SortableComponent component={activeDragData.component} />
        </Box>
      );
    }

    return null;
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', p: 2, gap: 2 }}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <ComponentLibrary />
        <SortableContext
          items={components.map((c) => c.id)}
          strategy={rectSortingStrategy}
        >
          <PreviewArea components={components} />
        </SortableContext>
        <DragOverlay>{renderDragOverlay()}</DragOverlay>
      </DndContext>
    </Box>
  );
}

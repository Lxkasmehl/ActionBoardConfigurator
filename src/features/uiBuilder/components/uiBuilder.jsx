import { useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
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

  const sensors = useSensors(
    useSensor(PointerSensor),
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

  const handleDragEnd = (event) => {
    const { active, over } = event;

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

  return (
    <Box sx={{ display: 'flex', height: '100vh', p: 2, gap: 2 }}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragEnd={handleDragEnd}
      >
        <ComponentLibrary />
        <SortableContext
          items={components.map((c) => c.id)}
          strategy={rectSortingStrategy}
        >
          <PreviewArea components={components} />
        </SortableContext>
      </DndContext>
    </Box>
  );
}

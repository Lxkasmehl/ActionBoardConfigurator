import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Box, Card, Typography } from '@mui/joy';
import ComponentLibrary from './ComponentLibrary';
import PreviewArea from './PreviewArea';
import { COMPONENT_CONFIGS } from './constants';

export default function UiBuilder() {
  const [components, setComponents] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setComponents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setComponents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addComponent = (type) => {
    const config = COMPONENT_CONFIGS[type];
    if (!config) return;

    const newComponent = {
      id: `component-${Date.now()}`,
      type,
      props: { ...config.defaultProps },
    };
    setComponents((prev) => [...prev, newComponent]);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', p: 2, gap: 2 }}>
      <ComponentLibrary onAddComponent={addComponent} />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <SortableContext
          items={components.map((c) => c.id)}
          strategy={rectSortingStrategy}
        >
          <PreviewArea components={components} />
        </SortableContext>
        <DragOverlay>
          {activeId ? (
            <Card
              sx={{
                width: 200,
                height: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'grabbing',
                opacity: 0.8,
              }}
            >
              <Typography>Dragging...</Typography>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </Box>
  );
}

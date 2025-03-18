import { useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Box } from '@mui/joy';
import ComponentLibrary from './ComponentLibrary';
import PreviewArea from './PreviewArea';
import { DragOverlayComponent } from './DragOverlayComponent';
import { collisionDetectionStrategy } from '../utils/collisionDetection';
import { useDragAndDrop } from '../hooks/useDragAndDrop';

export default function UiBuilder() {
  const [components, setComponents] = useState([]);
  const { activeDragData, handleDragStart, handleDragEnd } = useDragAndDrop(
    components,
    setComponents,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  );

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
        <DragOverlay>
          <DragOverlayComponent activeDragData={activeDragData} />
        </DragOverlay>
      </DndContext>
    </Box>
  );
}

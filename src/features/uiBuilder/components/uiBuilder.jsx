import { useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Box } from '@mui/joy';
import ComponentLibrary from './ComponentLibrary';
import PreviewArea from './PreviewArea';
import { DragOverlayComponent } from './DragOverlayComponent';
import { collisionDetectionStrategy } from '../utils/collisionDetection';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { myPointerSensor } from '../utils/myPointerSensor';

export default function UiBuilder() {
  const [components, setComponents] = useState([]);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const { activeDragData, handleDragStart, handleDragEnd } = useDragAndDrop(
    components,
    setComponents,
  );

  const sensors = useSensors(
    useSensor(myPointerSensor, {
      activationConstraint: {
        distance: 8,
        delay: 0,
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
          strategy={verticalListSortingStrategy}
          data={{
            isDragging: !!activeDragData,
          }}
        >
          <PreviewArea
            components={components}
            activeDragData={activeDragData}
            onTrashOver={(isOver) => setIsOverTrash(isOver)}
          />
        </SortableContext>
        <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
          <DragOverlayComponent
            activeDragData={activeDragData}
            isOverTrash={isOverTrash}
          />
        </DragOverlay>
      </DndContext>
    </Box>
  );
}

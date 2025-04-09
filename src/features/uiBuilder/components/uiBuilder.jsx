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
import ComponentLibrary from './layout/ComponentLibrary';
import PreviewArea from './layout/PreviewArea';
import { DragOverlayComponent } from './dragAndDrop/DragOverlayComponent';
import { collisionDetectionStrategy } from '../utils/collisionDetection';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { myPointerSensor } from '../utils/myPointerSensor';
import { useSelector } from 'react-redux';

export default function UiBuilder() {
  const [components, setComponents] = useState([]);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const isInGroupMode = useSelector((state) => state.uiBuilder.isInGroupMode);
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
    <>
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
      {isInGroupMode && (
        <Box
          sx={{
            height: '100vh',
            width: '100vw',
            backgroundColor: 'white',
            position: 'absolute',
            left: 0,
            top: 0,
            opacity: 0.65,
            zIndex: 10,
          }}
        />
      )}
    </>
  );
}

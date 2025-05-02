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
import { useSelector, useDispatch } from 'react-redux';
import { setComponents } from '@/redux/uiBuilderSlice';

export default function UiBuilder() {
  const [isOverTrash, setIsOverTrash] = useState(false);
  const dispatch = useDispatch();
  const components = useSelector((state) => state.uiBuilder.components);
  const isInCreateGroupMode = useSelector(
    (state) => state.uiBuilder.isInCreateGroupMode,
  );
  const groupToEdit = useSelector((state) => state.uiBuilder.groupToEdit);
  const { activeDragData, handleDragStart, handleDragEnd } = useDragAndDrop(
    components,
    (newComponents) => dispatch(setComponents(newComponents)),
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
            items={Array.isArray(components) ? components.map((c) => c.id) : []}
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
      {(isInCreateGroupMode || groupToEdit !== null) && (
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

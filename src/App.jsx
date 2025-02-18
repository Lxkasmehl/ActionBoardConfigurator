import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton } from '@mui/joy';
import { closestCorners, DndContext, useDroppable } from '@dnd-kit/core';

import { deleteID, deleteRawFormDataForId } from './redux/entitiesSlice.js';
import useFetchEntities from './hooks/useFetchEntities.js';
import EntitySection from './components/EntitySection.jsx';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export default function App() {
  const loading = useFetchEntities();
  const [sections, setSections] = useState([
    { id: 0, position: { x: 0, y: 0 } },
  ]);
  const dispatch = useDispatch();
  const config = useSelector((state) => state.entities.config);

  const { setNodeRef } = useDroppable({ id: 0 });

  const addSection = () => {
    const newId = sections.length
      ? Math.max(...sections.map((s) => s.id)) + 1
      : 0;
    setSections((prev) => [...prev, { id: newId, position: { x: 0, y: 0 } }]);
  };

  const removeSection = (id) => {
    setSections((prev) => prev.filter((section) => section.id !== id));
    dispatch(deleteID(id));
    dispatch(deleteRawFormDataForId({ id }));
    console.log(config);
  };

  const handleDragEnd = (event) => {
    const { active } = event;
    console.log('Position', event.delta.x, event.delta.y);

    const updatedSections = sections.map((section) =>
      section.id === active.id
        ? {
            ...section,
            position: {
              x: section.position.x + event.delta.x,
              y: section.position.y + event.delta.y,
            },
          }
        : section,
    );
    setSections(updatedSections);
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center w-screen h-screen'>
        <div className='animate-spin rounded-full h-24 w-24 border-t-4 border-blue-500'></div>
      </div>
    );
  }

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      <div
        ref={setNodeRef}
        className='flex flex-col w-screen h-full justify-center items-center py-20 relative'
      >
        <div className='w-full flex flex-col items-center'>
          {sections.map((section, index) => (
            <div
              key={section.id}
              className='flex flex-col items-center mt-5'
              style={{
                position: 'absolute',
                left: section.position.x,
                top: section.position.y,
              }}
            >
              <EntitySection key={section.id} id={section.id} />
              {index > 0 && (
                <IconButton
                  onClick={() => removeSection(section.id)}
                  variant='outlined'
                  color='danger'
                  sx={{
                    position: 'absolute',
                    left: '-60px',
                    top: 'calc(50% - 18px)',
                  }}
                >
                  <RemoveIcon />
                </IconButton>
              )}
            </div>
          ))}
        </div>

        <IconButton
          onClick={addSection}
          variant='solid'
          aria-label='Add new entity section'
          sx={{
            position: 'fixed',
            bottom: '40px',
            right: '40px',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
          }}
        >
          <AddIcon sx={{ fontSize: 32 }} />
        </IconButton>
      </div>
    </DndContext>
  );
}

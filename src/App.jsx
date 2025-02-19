import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconButton } from '@mui/joy';
import { closestCorners, DndContext } from '@dnd-kit/core';

import { deleteID, deleteRawFormDataForId } from './redux/entitiesSlice.js';
import useFetchEntities from './hooks/useFetchEntities.js';
import EntitySection from './components/EntitySection.jsx';

import AddIcon from '@mui/icons-material/Add';

export default function App() {
  const loading = useFetchEntities();
  const [sections, setSections] = useState([
    {
      id: 0,
      position: {
        x: window.innerWidth / 2 - 320,
        y: window.innerHeight / 2 - 55,
      },
    },
  ]);

  const dispatch = useDispatch();
  const config = useSelector((state) => state.entities.config);

  const addSection = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let newX = windowWidth / 2 - 320;
    let newY = windowHeight / 2 - 55;

    const occupiedPositions = sections.map((s) => s.position);
    while (
      occupiedPositions.some(
        (pos) => Math.abs(pos.x - newX) < 700 && Math.abs(pos.y - newY) < 150,
      )
    ) {
      newX += 20;
      newY += 20;
    }

    const newId = sections.length
      ? Math.max(...sections.map((s) => s.id)) + 1
      : 0;
    setSections((prev) => [
      ...prev,
      { id: newId, position: { x: newX, y: newY } },
    ]);
  };

  const removeSection = (id) => {
    setSections((prev) => prev.filter((section) => section.id !== id));
    dispatch(deleteID(id));
    dispatch(deleteRawFormDataForId({ id }));
    console.log(config);
  };

  const handleDragEnd = (event) => {
    const { active, delta } = event;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id !== active.id) return section;

        const newX = Math.min(
          Math.max(section.position.x + delta.x, 0),
          windowWidth - 700,
        );

        const newY = Math.min(
          Math.max(section.position.y + delta.y, 0),
          windowHeight - 150,
        );

        return {
          ...section,
          position: { x: newX, y: newY },
        };
      }),
    );
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center w-screen h-screen'>
        <div className='animate-spin rounded-full h-24 w-24 border-t-4 border-blue-500'></div>
      </div>
    );
  }

  // TODO: React Flow or React XArrows

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
      <div>
        <div className='w-full flex flex-col items-center'>
          {sections.map((section) => (
            <div
              key={section.id}
              className='flex flex-col items-center mt-5'
              style={{
                position: 'absolute',
                left: section.position.x,
                top: section.position.y,
              }}
            >
              <EntitySection
                key={section.id}
                id={section.id}
                onRemove={() => removeSection(section.id)}
              />
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

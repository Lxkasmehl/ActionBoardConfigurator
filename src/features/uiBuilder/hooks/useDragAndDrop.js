import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { createNewComponent } from '../utils/componentUtils';

export const useDragAndDrop = (components, setComponents) => {
  const [activeDragData, setActiveDragData] = useState(null);

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

    if (active.id.startsWith('component-')) {
      if (over.id === 'preview-area') {
        setComponents((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          return arrayMove(items, oldIndex, items.length);
        });
      } else if (over.id.startsWith('component-')) {
        setComponents((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
      return;
    }

    if (active.id.includes('library-') && over.id === 'preview-area') {
      const componentType = active.data.current.type;
      const newComponent = createNewComponent(componentType);
      setComponents((prev) => [...prev, newComponent]);
    }
  };

  return {
    activeDragData,
    handleDragStart,
    handleDragEnd,
  };
};

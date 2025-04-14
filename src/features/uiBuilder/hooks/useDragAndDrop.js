import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { createNewComponent } from '../utils/componentUtils';
import { useDispatch, useSelector } from 'react-redux';
import {
  checkAndDeleteEmptyGroups,
  updateComponentGroups,
} from '@/redux/uiBuilderSlice';

export const useDragAndDrop = (components, setComponents) => {
  const [activeDragData, setActiveDragData] = useState(null);
  const dispatch = useDispatch();
  const componentGroups = useSelector(
    (state) => state.uiBuilder.componentGroups,
  );

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

  const insertNewComponent = (targetIndex, componentType) => {
    const newComponent = createNewComponent(componentType);
    setComponents((items) => {
      const newItems = [...items];
      newItems.splice(targetIndex, 0, newComponent);
      return newItems;
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragData(null);

    if (!over) return;

    // Handle component deletion
    if (active.id.startsWith('component-') && over.id === 'trash-bin') {
      // Remove component from any groups it might be in
      const updatedGroups = { ...componentGroups };
      Object.keys(updatedGroups).forEach((groupId) => {
        const group = updatedGroups[groupId];
        if (group.components.includes(active.id)) {
          updatedGroups[groupId] = {
            ...group,
            components: group.components.filter((id) => id !== active.id),
          };
        }
      });

      // Update the component groups in Redux store
      dispatch(updateComponentGroups(updatedGroups));

      // Remove the component from the components list
      setComponents((items) => items.filter((item) => item.id !== active.id));

      // Check and delete any empty groups
      dispatch(checkAndDeleteEmptyGroups());
      return;
    }

    // Handle library component drag
    if (active.id.includes('library-')) {
      const componentType = active.data.current.type;

      if (over.id === 'preview-area') {
        setComponents((prev) => [...prev, createNewComponent(componentType)]);
        return;
      }

      if (over.id.startsWith('component-') || over.id.includes('gap')) {
        const targetIndex = components.findIndex(
          (item) => item.id === over.data.current.componentId,
        );
        const insertIndex =
          over.id === 'initial-gap' ? targetIndex : targetIndex + 1;
        insertNewComponent(insertIndex, componentType);
      }
      return;
    }

    // Handle existing component reordering
    if (active.id.startsWith('component-')) {
      if (over.id === 'preview-area') {
        setComponents((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          return arrayMove(items, oldIndex, items.length);
        });
        return;
      }

      if (over.id.startsWith('component-')) {
        setComponents((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
        return;
      }

      if (over.id.includes('gap')) {
        setComponents((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const targetIndex = items.findIndex(
            (item) => item.id === over.data.current.componentId,
          );
          return arrayMove(
            items,
            oldIndex,
            over.id === 'initial-gap'
              ? targetIndex
              : oldIndex > targetIndex
                ? targetIndex + 1
                : targetIndex,
          );
        });
      }
    }
  };

  return {
    activeDragData,
    handleDragStart,
    handleDragEnd,
  };
};

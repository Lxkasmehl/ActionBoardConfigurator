import { PointerSensor } from '@dnd-kit/core';

function isInteractiveElement(element) {
  const interactiveElements = [
    'button',
    'input',
    'textarea',
    'select',
    'option',
  ];

  if (interactiveElements.includes(element.tagName.toLowerCase())) {
    return true;
  }

  let currentElement = element;
  while (currentElement) {
    if (
      currentElement.classList &&
      (currentElement.classList.contains('MuiIconButton-root') ||
        currentElement.classList.contains('MuiIconButton-base') ||
        currentElement.classList.contains('MuiModal-root') ||
        currentElement.classList.contains('MuiDialog-root') ||
        currentElement.classList.contains('MuiOption-root') ||
        currentElement.classList.contains('MuiSelect-root') ||
        currentElement.classList.contains('MuiAutocompleteOption-root') ||
        currentElement.classList.contains('MuiAutocompleteListbox-root') ||
        currentElement.classList.contains('MuiAutocomplete-root') ||
        currentElement.classList.contains('MuiAutocomplete-listbox') ||
        currentElement.classList.contains('MuiAutocomplete-option') ||
        currentElement.classList.contains('MuiDataGrid-menu') ||
        currentElement.classList.contains('MuiDataGrid-menuList') ||
        currentElement.classList.contains('MuiMenuItem-root'))
    ) {
      return true;
    }
    currentElement = currentElement.parentElement;
  }

  return false;
}

export class myPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown',
      handler: ({ nativeEvent: event }) => {
        if (
          !event.isPrimary ||
          event.button !== 0 ||
          isInteractiveElement(event.target)
        ) {
          return false;
        }

        return true;
      },
    },
  ];
}

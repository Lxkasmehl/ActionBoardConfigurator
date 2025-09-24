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
      currentElement.classList.contains('MuiIconButton-root')
    ) {
      return true;
    }
    currentElement = currentElement.parentElement;
  }

  return false;
}

export class ButtonBarPointerSensor extends PointerSensor {
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

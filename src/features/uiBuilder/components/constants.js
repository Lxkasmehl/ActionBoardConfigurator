export const COMPONENT_TYPES = {
  HEADING: 'heading',
  PARAGRAPH: 'paragraph',
  BUTTON: 'button',
  CARD: 'card',
  IMAGE: 'image',
  FORM: 'form',
};

export const COMPONENT_CONFIGS = {
  [COMPONENT_TYPES.HEADING]: {
    label: 'Heading',
    icon: 'Title',
    defaultProps: {
      text: 'New Heading',
      level: 'h2',
    },
  },
  [COMPONENT_TYPES.PARAGRAPH]: {
    label: 'Paragraph',
    icon: 'TextFields',
    defaultProps: {
      text: 'New paragraph text',
    },
  },
  [COMPONENT_TYPES.BUTTON]: {
    label: 'Button',
    icon: 'SmartButton',
    defaultProps: {
      text: 'Click me',
      variant: 'solid',
      color: 'primary',
    },
  },
  [COMPONENT_TYPES.CARD]: {
    label: 'Card',
    icon: 'Rectangle',
    defaultProps: {
      content: 'Card content',
    },
  },
  [COMPONENT_TYPES.IMAGE]: {
    label: 'Image',
    icon: 'Image',
    defaultProps: {
      src: 'https://via.placeholder.com/150',
      alt: 'Placeholder image',
    },
  },
  [COMPONENT_TYPES.FORM]: {
    label: 'Form',
    icon: 'DynamicForm',
    defaultProps: {
      fields: [
        { type: 'text', label: 'Name', placeholder: 'Enter your name' },
        { type: 'email', label: 'Email', placeholder: 'Enter your email' },
      ],
    },
  },
};

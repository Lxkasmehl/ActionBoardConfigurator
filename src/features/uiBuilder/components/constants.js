export const COMPONENT_TYPES = {
  HEADING: 'heading',
  PARAGRAPH: 'paragraph',
  BUTTON: 'button',
  CARD: 'card',
  IMAGE: 'image',
  FORM: 'form',
  FILTER_AREA: 'filterArea',
  BUTTON_BAR: 'buttonBar',
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
  [COMPONENT_TYPES.IMAGE]: {
    label: 'Image',
    icon: 'Image',
    defaultProps: {
      src: 'https://placehold.co/500x200',
      alt: 'Placeholder image',
    },
  },
  [COMPONENT_TYPES.FILTER_AREA]: {
    label: 'FilterArea',
    icon: 'FilterList',
    defaultProps: {
      fields: [
        {
          type: 'autocomplete',
          label: 'Gender',
        },
        { type: 'autocomplete', label: 'Country' },
        {
          type: 'autocomplete',
          label: 'Division',
        },
        {
          type: 'dataTimePicker',
          label: 'Hire Date',
        },
      ],
    },
  },
  [COMPONENT_TYPES.BUTTON_BAR]: {
    label: 'ButtonBar',
    icon: 'ViewSidebar',
    defaultProps: {
      fields: [
        {
          type: 'button',
          'text/icon': 'Apply filter',
        },
        { type: 'button', 'text/icon': 'Clear all filter' },
        {
          type: 'iconButton',
          'text/icon': 'Settings',
        },
        {
          type: 'autocomplete',
          'text/icon': 'Templates',
        },
      ],
    },
  },
};

import { PREDEFINED_BUTTONS } from '../buttonBar/predefinedButtons';

export const COMPONENT_TYPES = {
  HEADING: 'heading',
  PARAGRAPH: 'paragraph',
  BUTTON: 'button',
  CARD: 'card',
  IMAGE: 'image',
  FORM: 'form',
  FILTER_AREA: 'filterArea',
  BUTTON_BAR: 'buttonBar',
  TABLE: 'table',
  CHART: 'chart',
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
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
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
          label: 'Recruiter',
        },
        { type: 'autocomplete', label: 'External Title' },
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
      fields: PREDEFINED_BUTTONS.slice(0, 4),
    },
  },
  [COMPONENT_TYPES.TABLE]: {
    label: 'Table',
    icon: 'TableChart',
    defaultProps: {
      columns: [
        {
          label: 'User id',
        },
        {
          label: 'Employee Name',
        },
        {
          label: 'Gender',
        },
        {
          label: 'Country',
        },
      ],
    },
  },
  [COMPONENT_TYPES.CHART]: {
    label: 'Chart',
    icon: 'Addchart',
    defaultProps: {
      type: 'bars',
    },
  },
};

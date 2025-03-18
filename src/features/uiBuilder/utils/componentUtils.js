import { COMPONENT_CONFIGS } from '../components/constants';

export const createNewComponent = (componentType) => {
  const config = COMPONENT_CONFIGS[componentType];
  if (!config) return null;

  return {
    id: `component-${Date.now()}`,
    type: componentType,
    props: { ...config.defaultProps },
  };
};

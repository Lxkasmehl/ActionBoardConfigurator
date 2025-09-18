import { COMPONENT_CONFIGS } from '../components/common/constants';

export const createNewComponent = (componentType) => {
  const config = COMPONENT_CONFIGS[componentType];
  if (!config) return null;

  return {
    id: `component-${Date.now()}`,
    type: componentType,
    props: { ...config.defaultProps },
  };
};

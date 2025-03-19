import { pointerWithin, rectIntersection } from '@dnd-kit/core';

export const collisionDetectionStrategy = (args) => {
  const pointerCollisions = pointerWithin(args);
  const rectCollisions = rectIntersection(args);

  if (pointerCollisions.length > 0) {
    const previewAreaCollision = pointerCollisions.find(
      (collision) => collision.id === 'preview-area',
    );

    const componentCollisions = pointerCollisions.filter((collision) =>
      collision.id.startsWith('component-'),
    );

    if (componentCollisions.length > 0) {
      return [componentCollisions[componentCollisions.length - 1]];
    }

    if (previewAreaCollision) {
      return [previewAreaCollision];
    }
  }

  return rectCollisions;
};

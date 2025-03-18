import { pointerWithin, rectIntersection } from '@dnd-kit/core';

export const collisionDetectionStrategy = (args) => {
  const pointerCollisions = pointerWithin(args);

  if (pointerCollisions.length > 0) {
    const previewAreaCollision = pointerCollisions.find(
      (collision) => collision.id === 'preview-area',
    );

    if (previewAreaCollision) {
      return [previewAreaCollision];
    }
  }

  return rectIntersection(args);
};

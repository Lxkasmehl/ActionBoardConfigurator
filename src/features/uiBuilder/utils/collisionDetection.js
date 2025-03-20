import { pointerWithin, rectIntersection } from '@dnd-kit/core';

export const collisionDetectionStrategy = (args) => {
  const pointerCollisions = pointerWithin(args);
  const rectCollisions = rectIntersection(args);

  if (pointerCollisions.length > 0) {
    const trashBinCollision = pointerCollisions.find(
      (collision) => collision.id === 'trash-bin',
    );
    if (trashBinCollision) {
      return [trashBinCollision];
    }
  }

  const componentCollisions = rectCollisions.filter((collision) =>
    collision.id.startsWith('component-'),
  );

  if (componentCollisions.length > 0) {
    return [componentCollisions[0]];
  }

  if (pointerCollisions.length > 0) {
    const previewAreaCollision = pointerCollisions.find(
      (collision) => collision.id === 'preview-area',
    );
    if (previewAreaCollision) {
      return [previewAreaCollision];
    }
  }

  return [];
};

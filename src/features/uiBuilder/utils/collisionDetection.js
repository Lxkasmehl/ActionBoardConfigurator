import { pointerWithin, rectIntersection } from '@dnd-kit/core';

export const collisionDetectionStrategy = (args) => {
  const pointerCollisions = pointerWithin(args);
  const rectCollisions = rectIntersection(args);
  
  const trashBinPointerCollision = pointerCollisions.find(
    (collision) => collision.id === 'trash-bin',
  );
  const trashBinRectCollision = rectCollisions.find(
    (collision) => collision.id === 'trash-bin',
  );

  if (trashBinPointerCollision || trashBinRectCollision) {
    return [trashBinPointerCollision || trashBinRectCollision];
  }

  const componentCollisions = pointerCollisions.filter((collision) =>
    collision.id.startsWith('component-'),
  );

  if (componentCollisions.length > 0) {
    return [componentCollisions[0]];
  }

  const gapCollisions = pointerCollisions.filter((collision) =>
    collision.id.includes('gap'),
  );

  if (gapCollisions.length > 0) {
    return [gapCollisions[0]];
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

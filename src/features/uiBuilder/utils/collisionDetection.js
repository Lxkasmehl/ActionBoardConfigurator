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
    const bestCollision = componentCollisions.reduce((best, current) => {
      const bestRatio = best?.data?.current?.intersectionRatio ?? 0;
      const currentRatio = current?.data?.current?.intersectionRatio ?? 0;
      return currentRatio > bestRatio ? current : best;
    });
    return [bestCollision];
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

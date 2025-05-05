import { pointerWithin, rectIntersection } from '@dnd-kit/core';

export const collisionDetectionStrategy = (args) => {
  const pointerCollisions = pointerWithin(args);
  const rectCollisions = rectIntersection(args);

  // First check for trash bin collisions
  const trashBinPointerCollision = pointerCollisions.find(
    (collision) => collision.id === 'trash-bin',
  );
  const trashBinRectCollision = rectCollisions.find(
    (collision) => collision.id === 'trash-bin',
  );

  if (trashBinPointerCollision || trashBinRectCollision) {
    return [trashBinPointerCollision || trashBinRectCollision];
  }

  // Then check for component collisions with both pointer and rect
  const componentPointerCollisions = pointerCollisions.filter((collision) =>
    collision.id.startsWith('component-'),
  );
  const componentRectCollisions = rectCollisions.filter((collision) =>
    collision.id.startsWith('component-'),
  );

  // If we have both types of collisions for the same component, prefer that
  const combinedComponentCollisions = componentPointerCollisions.filter((pc) =>
    componentRectCollisions.some((rc) => rc.id === pc.id),
  );

  if (combinedComponentCollisions.length > 0) {
    return [combinedComponentCollisions[0]];
  }

  // If no combined collisions, use pointer collisions
  if (componentPointerCollisions.length > 0) {
    return [componentPointerCollisions[0]];
  }

  // Then check for gap collisions
  const gapCollisions = pointerCollisions.filter((collision) =>
    collision.id.includes('gap'),
  );

  if (gapCollisions.length > 0) {
    return [gapCollisions[0]];
  }

  // Finally check for preview area
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

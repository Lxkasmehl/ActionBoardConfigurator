import { Autocomplete } from '@mui/joy';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import PropTypes from 'prop-types';

export default function DropdownEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            position: 'absolute',
            pointerEvents: 'all',
            transformOrigin: 'center',
          }}
        >
          <Autocomplete options={['Option 1', 'Option 2', 'Option 3']} />
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

DropdownEdge.propTypes = {
  id: PropTypes.string.isRequired,
  sourceX: PropTypes.number.isRequired,
  sourceY: PropTypes.number.isRequired,
  targetX: PropTypes.number.isRequired,
  targetY: PropTypes.number.isRequired,
  sourcePosition: PropTypes.string.isRequired,
  targetPosition: PropTypes.string.isRequired,
  style: PropTypes.object,
  markerEnd: PropTypes.string,
};

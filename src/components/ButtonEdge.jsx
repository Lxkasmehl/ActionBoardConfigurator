import { IconButton } from '@mui/joy';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react';
import PropTypes from 'prop-types';
import ClearIcon from '@mui/icons-material/Clear';

export default function DropdownEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

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
          <IconButton
            onClick={onEdgeClick}
            variant='plain'
            color='danger'
            sx={{
              borderRadius: '50%',
              background: 'white',
            }}
          >
            <ClearIcon />
          </IconButton>
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

import { useRef } from 'react';
import DataPicker from './DataPicker';

const DataPickerWrapper = () => {
  const containerRef = useRef(null);

  const handleNodeSelected = () => {
    // No-op for direct route usage
  };

  const handleDataFetch = () => {
    // No-op for direct route usage
  };

  const handleWarning = () => {
    // No-op for direct route usage
  };

  return (
    <DataPicker
      containerRef={containerRef}
      onNodeSelected={handleNodeSelected}
      onDataFetch={handleDataFetch}
      onWarning={handleWarning}
    />
  );
};

export default DataPickerWrapper;

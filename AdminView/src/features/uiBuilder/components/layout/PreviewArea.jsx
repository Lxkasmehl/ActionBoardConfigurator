import { Box, Card, Typography, Button } from '@mui/joy';
import PropTypes from 'prop-types';
import { useDroppable } from '@dnd-kit/core';
import SortableComponent from '../dragAndDrop/SortableComponent';
import EmptyState from './EmptyState';
import TrashBin from './TrashBin';
import ConfigManagement from './ConfigManagement';
import { useSelector } from 'react-redux';
import { db } from '../../../../firebase';
import { setDoc, doc } from 'firebase/firestore';

export default function PreviewArea({ activeDragData, onTrashOver }) {
  const isInCreateGroupMode = useSelector(
    (state) => state.uiBuilder.isInCreateGroupMode,
  );
  const groupToEdit = useSelector((state) => state.uiBuilder.groupToEdit);
  const columnData = useSelector((state) => state.uiBuilder.columnData);
  const tableColumns = useSelector((state) => state.uiBuilder.tableColumns);
  const components = useSelector((state) => state.uiBuilder.components);
  const componentGroups = useSelector(
    (state) => state.uiBuilder.componentGroups,
  );
  const tableData = useSelector((state) => state.uiBuilder.tableData);
  const visibleColumns = useSelector((state) => state.uiBuilder.visibleColumns);
  const tableConfigEntries = useSelector(
    (state) => state.uiBuilder.tableConfigEntries,
  );
  const { setNodeRef, isOver } = useDroppable({
    id: 'preview-area',
    data: { type: 'preview-area' },
    disabled: isInCreateGroupMode || groupToEdit !== null,
  });

  const { setNodeRef: setInitialGapRef, isOver: isInitialGapOver } =
    useDroppable({
      id: 'initial-gap',
      data: {
        type: 'gap',
        componentId: components[0]?.id,
      },
      disabled: isInCreateGroupMode || groupToEdit !== null,
    });

  const isDraggingExistingComponent = activeDragData?.type === 'preview';

  // Utility function to remove undefined values from objects
  const removeUndefinedValues = (obj) => {
    if (obj === null || obj === undefined) {
      return null;
    }
    if (Array.isArray(obj)) {
      return obj
        .map(removeUndefinedValues)
        .filter((item) => item !== null && item !== undefined);
    }
    if (typeof obj === 'object') {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        const cleanedValue = removeUndefinedValues(value);
        if (cleanedValue !== null && cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
      return cleaned;
    }
    return obj;
  };

  const handleExport = async () => {
    try {
      console.log(
        'exporting website',
        components,
        columnData,
        tableColumns,
        componentGroups,
        tableData,
        visibleColumns,
        tableConfigEntries,
      );

      // Clean the data to remove undefined values before sending to Firebase
      const cleanedData = removeUndefinedValues({
        components,
        columnData,
        tableColumns,
        componentGroups,
        tableData,
        visibleColumns,
        tableConfigEntries,
      });

      // For backward compatibility, still save to apps/01
      await setDoc(doc(db, 'apps', '01'), cleanedData);
      console.log('Successfully exported to Firebase (legacy apps/01)');
    } catch (error) {
      console.error('Error exporting to Firebase:', error);
      // You could add user notification here if needed
    }
  };

  return (
    <Card
      sx={{
        flex: 1,
        height: '100%',
        p: 2,
        transition: 'background-color 0.2s ease',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          mx: 2,
        }}
      >
        <Typography level='h4'>Preview</Typography>
        <ConfigManagement />
      </Box>

      <Box
        id='preview-area'
        ref={setNodeRef}
        sx={{
          height: '100%',
          pt: 0,
          px: 2,
          pb: 2,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'sm',
          position: 'relative',
          overflowY: 'auto',
        }}
        data-testid='preview-area'
      >
        {components.length === 0 ? (
          <EmptyState isOver={isOver} />
        ) : (
          <>
            <Box
              ref={setInitialGapRef}
              sx={{
                height: '16px',
                width: '100%',
                position: 'relative',
                flexShrink: 0,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '50%',
                  height: '2px',
                  backgroundColor: isInitialGapOver
                    ? 'primary.500'
                    : 'transparent',
                  transition: 'background-color 0.2s ease',
                },
              }}
            />
            {components.map((component, index) => (
              <SortableComponent
                key={component.id}
                component={component}
                isOver={isOver}
                isLast={index === components.length - 1}
              />
            ))}
          </>
        )}
        <TrashBin
          isVisible={isDraggingExistingComponent}
          onOverChange={onTrashOver}
        />
      </Box>
    </Card>
  );
}

PreviewArea.propTypes = {
  components: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      props: PropTypes.object,
    }),
  ).isRequired,
  activeDragData: PropTypes.shape({
    type: PropTypes.oneOf(['library', 'preview']),
    component: PropTypes.object,
  }),
  onTrashOver: PropTypes.func.isRequired,
};

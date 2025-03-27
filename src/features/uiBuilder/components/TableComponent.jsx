import { Table, IconButton } from '@mui/joy';
import { Add } from '@mui/icons-material';
import { useState } from 'react';
import EditModal from './EditModal';
import PropTypes from 'prop-types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import DraggableColumn from './DraggableColumn';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { useTableData } from '../hooks/useTableData';
import { generateNewValue, getInitialDummyData } from '../utils/tableUtils';
import { ColumnDragOverlay } from './ColumnDragOverlay';

export default function TableComponent({ component }) {
  const [columns, setColumns] = useState(component.props.columns);
  const [hoveredColumn, setHoveredColumn] = useState(null);
  const [hoveredColumnHeader, setHoveredColumnHeader] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);
  const [dummyData, setDummyData] = useTableData(
    columns,
    getInitialDummyData(),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const column = columns.find((col) => col.label === active.id);
    if (column) {
      setActiveColumn(column);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveColumn(null);

    if (active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.label === active.id);
        const newIndex = items.findIndex((item) => item.label === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleAddColumn = () => {
    const newColumnLabel = `Column ${columns.length + 1}`;
    const newColumn = {
      label: newColumnLabel,
      type: 'text',
    };

    setColumns([...columns, newColumn]);

    setDummyData(
      dummyData.map((row) => ({
        ...row,
        [newColumnLabel]: '',
      })),
    );
  };

  const handleEditColumn = (column) => {
    setEditingColumn(column);
  };

  const handleSaveColumn = (editedColumn) => {
    const newColumns = columns.map((col) =>
      col.label === editingColumn.label ? editedColumn : col,
    );
    setColumns(newColumns);

    if (editedColumn.type === 'entity') {
      return;
    }

    const newData = dummyData.map((row) => {
      const newRow = { ...row };
      newRow[editedColumn.label] = generateNewValue(editedColumn.type);
      return newRow;
    });
    setDummyData(newData);
  };

  const handleDeleteColumn = (columnLabel) => {
    setColumns(columns.filter((col) => col.label !== columnLabel));
    setDummyData(
      dummyData.map((row) => {
        const newRow = { ...row };
        delete newRow[columnLabel];
        return newRow;
      }),
    );
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Table borderAxis='bothBetween' color='neutral' variant='outlined'>
          <thead>
            <tr>
              <SortableContext
                items={columns.map((col) => col.label)}
                strategy={horizontalListSortingStrategy}
              >
                {columns.map((column) => (
                  <DraggableColumn
                    key={column.label}
                    column={column}
                    onEdit={handleEditColumn}
                    isHovered={hoveredColumnHeader === column.label}
                    isColumnHovered={hoveredColumn === column.label}
                    onMouseEnter={() => setHoveredColumn(column.label)}
                    onMouseLeave={() => setHoveredColumn(null)}
                    onHeaderMouseEnter={(label) =>
                      setHoveredColumnHeader(label)
                    }
                    onHeaderMouseLeave={() => setHoveredColumnHeader(null)}
                    data={dummyData}
                  />
                ))}
              </SortableContext>
            </tr>
          </thead>
        </Table>
        <DragOverlay modifiers={[restrictToHorizontalAxis]}>
          <ColumnDragOverlay
            activeColumn={activeColumn}
            dummyData={dummyData}
          />
        </DragOverlay>
      </DndContext>
      <IconButton
        variant='solid'
        color='primary'
        onClick={handleAddColumn}
        sx={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          borderRadius: '50%',
        }}
      >
        <Add />
      </IconButton>
      {editingColumn && (
        <EditModal
          open={!!editingColumn}
          onClose={() => setEditingColumn(null)}
          item={editingColumn}
          onSave={handleSaveColumn}
          onDelete={handleDeleteColumn}
          type='column'
          title='Edit Column'
        />
      )}
    </>
  );
}

TableComponent.propTypes = {
  component: PropTypes.shape({
    props: PropTypes.shape({
      columns: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          type: PropTypes.string.isRequired,
          entity: PropTypes.string,
          property: PropTypes.string,
        }),
      ).isRequired,
    }).isRequired,
  }).isRequired,
};

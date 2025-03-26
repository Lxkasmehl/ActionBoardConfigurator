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
import { DragIndicator } from '@mui/icons-material';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';

export default function TableComponent({ component }) {
  const [columns, setColumns] = useState(component.props.columns);
  const [hoveredColumn, setHoveredColumn] = useState(null);
  const [hoveredColumnHeader, setHoveredColumnHeader] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);
  const [dummyData, setDummyData] = useState([
    {
      'User id': 1001,
      'Employee Name': 'John Smith',
      Gender: 'M',
      Country: 'USA',
    },
    {
      'User id': 1002,
      'Employee Name': 'Sarah Johnson',
      Gender: 'F',
      Country: 'Canada',
    },
  ]);

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

  const generateNewValue = (type) => {
    let start, end, texts;
    switch (type) {
      case 'number':
        return Math.floor(Math.random() * 1000);
      case 'boolean':
        return Math.random() > 0.5;
      case 'date':
        start = new Date(2020, 0, 1);
        end = new Date();
        return new Date(
          start.getTime() + Math.random() * (end.getTime() - start.getTime()),
        )
          .toISOString()
          .split('T')[0];
      case 'text':
        texts = [
          'Sample Text',
          'Example Data',
          'Random Value',
          'Test Entry',
          'Demo Content',
        ];
        return texts[Math.floor(Math.random() * texts.length)];
      default:
        return '';
    }
  };

  const handleSaveColumn = (editedColumn) => {
    const newColumns = columns.map((col) =>
      col.label === editingColumn.label ? editedColumn : col,
    );
    setColumns(newColumns);

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

  const ColumnDragOverlay = () => {
    if (!activeColumn) return null;

    return (
      <Table
        borderAxis='bothBetween'
        color='neutral'
        variant='outlined'
        sx={{
          borderRadius: 0,
          border: '2px solid #ced8e2',
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                verticalAlign: 'middle',
                position: 'relative',
                cursor: 'grabbing',
                backgroundColor: 'background.level1',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                opacity: 0.8,
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <div
                  style={{
                    cursor: 'grab',
                    position: 'absolute',
                    top: '-4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    rotate: '90deg',
                    zIndex: 1000,
                    borderRadius: '4px',
                    backgroundColor: '#ced8e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px 0px',
                  }}
                >
                  <DragIndicator fontSize='small' />
                </div>
                {activeColumn.label}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {dummyData.map((row, index) => (
            <tr key={index}>
              <td>{row[activeColumn.label]}</td>
            </tr>
          ))}
        </tbody>
      </Table>
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
          <ColumnDragOverlay />
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
        }),
      ).isRequired,
    }).isRequired,
  }).isRequired,
};

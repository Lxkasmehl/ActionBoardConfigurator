import { Table, IconButton, Input } from '@mui/joy';
import { COMPONENT_TYPES, COMPONENT_CONFIGS } from './constants';
import { Add, Edit, Check } from '@mui/icons-material';
import { useState } from 'react';

export default function TableComponent() {
  const [columns, setColumns] = useState(
    COMPONENT_CONFIGS[COMPONENT_TYPES.TABLE].defaultProps.columns,
  );
  const [hoveredColumn, setHoveredColumn] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [editValue, setEditValue] = useState('');
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

  const handleEditColumn = (columnLabel) => {
    setEditingColumn(columnLabel);
    setEditValue(columnLabel);
  };

  const handleSaveEdit = () => {
    if (!editValue.trim()) return;

    const newColumns = columns.map((col) =>
      col.label === editingColumn ? { ...col, label: editValue } : col,
    );
    setColumns(newColumns);

    const newData = dummyData.map((row) => {
      const newRow = { ...row };
      newRow[editValue] = newRow[editingColumn];
      delete newRow[editingColumn];
      return newRow;
    });
    setDummyData(newData);

    setEditingColumn(null);
  };

  const handleCancelEdit = () => {
    setEditingColumn(null);
  };

  return (
    <>
      <Table borderAxis='bothBetween' color='neutral' variant='outlined'>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.label}
                style={{
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  verticalAlign: 'middle',
                  position: 'relative',
                }}
                onMouseEnter={() => setHoveredColumn(column.label)}
                onMouseLeave={() => setHoveredColumn(null)}
              >
                {editingColumn === column.label ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Input
                      size='sm'
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSaveEdit();
                        }
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCancelEdit();
                        }
                      }}
                    />
                    <IconButton
                      size='sm'
                      variant='plain'
                      color='success'
                      onClick={handleSaveEdit}
                    >
                      <Check fontSize='small' />
                    </IconButton>
                  </div>
                ) : (
                  <>
                    {column.label}
                    {hoveredColumn === column.label && (
                      <IconButton
                        size='sm'
                        variant='plain'
                        color='neutral'
                        onClick={() => handleEditColumn(column.label)}
                        sx={{
                          position: 'absolute',
                          right: '4px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          opacity: 0.7,
                          '&:hover': {
                            opacity: 1,
                          },
                        }}
                      >
                        <Edit fontSize='small' />
                      </IconButton>
                    )}
                  </>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dummyData.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.label}>{row[column.label]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
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
    </>
  );
}

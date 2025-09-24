import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { GridColumnMenu, useGridApiContext } from '@mui/x-data-grid-pro';
import EditItem from './EditItem';
import DeleteItem from './DeleteItem';

export default function CustomColumnMenu({
  onEditColumn,
  onDeleteColumn,
  ...props
}) {
  const apiRef = useGridApiContext();
  const menuRef = useRef(null);
  const [position, setPosition] = useState(null);

  // Position anhand der Spalten-Header berechnen
  useEffect(() => {
    if (!props.colDef) return;
    const headerEl =
      apiRef.current?.getColumnHeaderElement?.(props.colDef.field) ||
      document.querySelector(`[data-field="${props.colDef.field}"]`);
    if (!headerEl) return;
    const rect = headerEl.getBoundingClientRect();
    setPosition({ top: rect.bottom, left: rect.left, width: rect.width });
  }, [props.colDef, apiRef]);

  // Fokus-Scroll unterdrücken
  useEffect(() => {
    if (!position || !menuRef.current) return;
    try {
      menuRef.current.focus({ preventScroll: true });
    } catch {
      menuRef.current.focus();
    }
  }, [position]);

  if (!position) return null;

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      tabIndex={-1}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        minWidth: position.width,
        backgroundColor: 'white',
        boxShadow:
          '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)',
        transition:
          'opacity 317ms cubic-bezier(0.4, 0, 0.2, 1), transform 211ms cubic-bezier(0.4, 0, 0.2, 1), transform 211ms cubic-bezier(0.4, 0, 0.2, 1)',
        color: 'rgba(0, 0, 0, 0.87)',
        borderRadius: '4px',
      }}
    >
      <GridColumnMenu
        {...props}
        slots={{
          columnMenuEditItem: EditItem,
          columnMenuDeleteItem: DeleteItem,
          columnMenuFilter: null,
          // alle Default-Slots bleiben automatisch erhalten
        }}
        slotProps={{
          columnMenuEditItem: {
            displayOrder: 1,
            editValue: 'Edit Column',
            editHandler: () => onEditColumn(props.colDef.columnId),
          },
          columnMenuDeleteItem: {
            displayOrder: 2,
            deleteValue: 'Delete Column',
            deleteHandler: () => onDeleteColumn(props.colDef.columnId),
          },
        }}
      />
    </div>,
    document.body,
  );
}

CustomColumnMenu.propTypes = {
  onEditColumn: PropTypes.func.isRequired,
  onDeleteColumn: PropTypes.func.isRequired,
  colDef: PropTypes.shape({
    columnId: PropTypes.string.isRequired,
    field: PropTypes.string.isRequired,
    headerName: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  api: PropTypes.object,
  currentColumn: PropTypes.object,
};

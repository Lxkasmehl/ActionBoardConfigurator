import * as XLSX from 'xlsx';

export const exportToExcel = (
  data,
  visibleColumns = null,
  tableColumns = null,
  filename = 'export.xlsx'
) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  let exportData = data;

  // If visibleColumns and tableColumns are provided, filter the data
  if (visibleColumns && tableColumns) {
    const columnMap = {};
    tableColumns.forEach((col) => {
      columnMap[col.id] = col.label;
    });

    // Filter columns based on visible columns
    const visibleColumnIds = visibleColumns.map((colId) => {
      const column = tableColumns.find((col) => col.id === colId);
      return column ? column.id : colId;
    });

    exportData = data.map((row) => {
      const filteredRow = {};
      visibleColumnIds.forEach((colId) => {
        if (row.hasOwnProperty(colId)) {
          const displayName = columnMap[colId] || colId;
          filteredRow[displayName] = row[colId];
        }
      });
      return filteredRow;
    });
  }

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Data');

  // Generate and download file
  XLSX.writeFile(wb, filename);
};

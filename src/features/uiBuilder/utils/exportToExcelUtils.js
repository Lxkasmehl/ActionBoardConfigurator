import * as XLSX from 'xlsx';

export const exportToExcel = (
  tableData,
  visibleColumns,
  tableColumns,
  fileName,
) => {
  if (!tableData || tableData.length === 0) {
    console.log('No data to export');
    return;
  }

  // Create a map of column IDs to labels
  const columnMap = {};
  if (tableColumns) {
    tableColumns.forEach((column) => {
      columnMap[column.id] = column.label;
    });
  }

  // Filter table data to only include visible columns
  const filteredData = tableData.map((row) => {
    const filteredRow = {};
    if (visibleColumns) {
      visibleColumns.forEach((columnId) => {
        const columnLabel = columnMap[columnId];
        if (columnLabel && row[columnLabel] !== undefined) {
          filteredRow[columnLabel] = row[columnLabel];
        }
      });
    } else {
      // If no visible columns specified, export all columns
      Object.entries(row).forEach(([key, value]) => {
        filteredRow[key] = value;
      });
    }
    return filteredRow;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(filteredData);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  const excelBuffer = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array',
  });

  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

import { Box } from '@mui/material';
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid-pro';

export default function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      <Box sx={{ flexGrow: 1 }} />
      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
}

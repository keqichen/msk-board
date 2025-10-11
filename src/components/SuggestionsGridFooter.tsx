import { Button, Box } from "@mui/material";
import { GridFooter, GridFooterContainer } from "@mui/x-data-grid";
import {
  useGridApiContext,
  useGridSelector,
  gridRowSelectionIdsSelector,
} from "@mui/x-data-grid-pro";
type SuggestionsGridFooterProps = {
  onBulkAssignClick: () => void;
};

const SuggestionsGridFooter = ({
  onBulkAssignClick,
}: SuggestionsGridFooterProps) => {
  const apiRef = useGridApiContext();
  const selectedIds = useGridSelector(apiRef, gridRowSelectionIdsSelector); // GridRowId[]
  return (
    <GridFooterContainer>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 2 }}>
        <Button
          variant="contained"
          size="small"
          disabled={!selectedIds.size}
          onClick={onBulkAssignClick}
          sx={{ textTransform: "none" }}
        >
          Bulk update ({selectedIds.size})
        </Button>
      </Box>
      <GridFooter />
    </GridFooterContainer>
  );
};

export default SuggestionsGridFooter;

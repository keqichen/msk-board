import { Button, Box } from "@mui/material";
import { GridFooter, GridFooterContainer } from "@mui/x-data-grid";

interface SuggestionsGridFooterProps {
  selectionCount: number;
  onBulkAssignClick: () => void;
}

const SuggestionsGridFooter = ({
  selectionCount,
  onBulkAssignClick,
}: SuggestionsGridFooterProps) => {
  return (
    <GridFooterContainer>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, px: 2 }}>
        <Button
          variant="contained"
          size="small"
          disabled={!selectionCount}
          onClick={onBulkAssignClick}
        >
          Bulk update ({selectionCount})
        </Button>
      </Box>
      <GridFooter />
    </GridFooterContainer>
  );
};

export default SuggestionsGridFooter;

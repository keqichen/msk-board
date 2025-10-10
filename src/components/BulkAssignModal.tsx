import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
} from "@mui/material";
import { SuggestionStatus } from "../gql/generated";

const STATUSES: SuggestionStatus[] = [
  SuggestionStatus.Pending,
  SuggestionStatus.InProgress,
  SuggestionStatus.Completed,
  SuggestionStatus.Dismissed,
  SuggestionStatus.Overdue,
];

type BulkAssignDialogProps = {
  open: boolean;
  onClose: () => void;
  selectionCount: number;
  targetStatus: SuggestionStatus;
  setTargetStatus: (status: SuggestionStatus) => void;
  onConfirm: () => void;
};

const BulkAssignModal = ({
  open,
  onClose,
  selectionCount,
  targetStatus,
  setTargetStatus,
  onConfirm,
}: BulkAssignDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Bulk Update Status</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Change status for {selectionCount} selected suggestion
          {selectionCount !== 1 ? "s" : ""}
        </Typography>

        <FormControl fullWidth>
          <InputLabel>New Status</InputLabel>
          <Select
            value={targetStatus}
            label="New Status"
            onChange={(e) =>
              setTargetStatus(e.target.value as SuggestionStatus)
            }
          >
            {STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkAssignModal;

import {
  Stack,
  TextField,
  InputAdornment,
  Button,
  Typography,
} from "@mui/material";
import { Search as SearchIcon, Add } from "@mui/icons-material";
import { useBoardStore } from "../store/useBoardStore";

interface SuggestionsHeaderProps {
  onAddClick: () => void;
}

const SuggestionsHeader = ({ onAddClick }: SuggestionsHeaderProps) => {
  const { filters, setFilters } = useBoardStore();

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ mb: 2 }}
    >
      <Typography variant="h4" component="h1" sx={{ margin: 0 }}>
        MSK Suggestion Board
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          placeholder="Search..."
          value={filters.q || ""}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: 300 }}
        />

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAddClick}
          sx={{ textTransform: "none", minWidth: "180px" }}
        >
          Add Suggestion
        </Button>
      </Stack>
    </Stack>
  );
};

export default SuggestionsHeader;

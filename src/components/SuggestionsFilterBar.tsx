import { Button, MenuItem, Select, Stack } from "@mui/material";
import { Add } from "@mui/icons-material";
import type { SuggestionsQueryVariables } from "../gql/generated";
import { CATEGORIES, STATUSES } from "../constants/suggestions";

type SuggestionsFilterBarProps = {
  filters: SuggestionsQueryVariables;
  setFilters: (partial: Partial<SuggestionsQueryVariables>) => void;
  onAddClick: () => void;
};

export default function SuggestionsFilterBar({
  filters,
  setFilters,
  onAddClick,
}: SuggestionsFilterBarProps) {
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Select
        size="small"
        displayEmpty
        value={filters.status ?? ""}
        onChange={(e) => setFilters({ status: e.target.value || undefined })}
      >
        <MenuItem value="">All Statuses</MenuItem>
        {STATUSES.map((status) => (
          <MenuItem key={status} value={status}>
            {status}
          </MenuItem>
        ))}
      </Select>

      <Select
        size="small"
        displayEmpty
        value={filters.category ?? ""}
        onChange={(e) => setFilters({ category: e.target.value || undefined })}
      >
        <MenuItem value="">All Categories</MenuItem>
        {CATEGORIES.map((category) => (
          <MenuItem key={category} value={category}>
            {category}
          </MenuItem>
        ))}
      </Select>

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={onAddClick}
        sx={{ ml: "auto" }}
      >
        Add Suggestion
      </Button>
    </Stack>
  );
}

import { Button, MenuItem, Select, Stack } from "@mui/material";
import { SuggestionStatus, Category } from "../gql/generated";
import type { SuggestionsQueryVariables } from "../gql/generated";

const STATUSES: SuggestionStatus[] = [
  SuggestionStatus.Pending,
  SuggestionStatus.InProgress,
  SuggestionStatus.Completed,
  SuggestionStatus.Dismissed,
  SuggestionStatus.Overdue,
];

const CATEGORIES: Category[] = [
  Category.Exercise,
  Category.Equipment,
  Category.Behavioural,
  Category.Lifestyle,
];

interface SuggestionsFilterBarProps {
  filters: SuggestionsQueryVariables;
  setFilters: (partial: Partial<SuggestionsQueryVariables>) => void;
  targetStatus: SuggestionStatus;
  setTargetStatus: (status: SuggestionStatus) => void;
  selectionCount: number;
  onBatchChange: () => void;
}

export default function SuggestionsFilterBar({
  filters,
  setFilters,
  targetStatus,
  setTargetStatus,
  selectionCount,
  onBatchChange,
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

      <Stack direction="row" gap={1} sx={{ ml: "auto" }}>
        <Select
          size="small"
          value={targetStatus}
          onChange={(e) => setTargetStatus(e.target.value as SuggestionStatus)}
        >
          {STATUSES.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </Select>

        <Button
          variant="contained"
          disabled={selectionCount === 0}
          onClick={onBatchChange}
        >
          Set {targetStatus} ({selectionCount})
        </Button>
      </Stack>
    </Stack>
  );
}

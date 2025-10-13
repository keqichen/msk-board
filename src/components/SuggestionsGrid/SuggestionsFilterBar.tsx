import {
  Autocomplete,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import {
  EmployeesDocument,
  type SuggestionsQueryVariables,
} from "../../gql/generated";
import { CATEGORIES, PRIORITIES, STATUSES } from "../../constants/suggestions";
import { toTitleCase } from "../../utils/stringUtils";
import { useQuery } from "@apollo/client/react";
import useResponsive from "../../hooks/useResponsive";

type SuggestionsFilterBarProps = {
  filters: SuggestionsQueryVariables;
  setFilters: (partial: Partial<SuggestionsQueryVariables>) => void;
};

export default function SuggestionsFilterBar({
  filters,
  setFilters,
}: SuggestionsFilterBarProps) {
  const { isSmallScreen, isLargeScreen } = useResponsive();

  const { data: employeesData, loading: employeesLoading } =
    useQuery(EmployeesDocument);

  const employees = employeesData?.employees ?? [];

  // Find selected employee from filters
  const selectedEmployee =
    employees.find((emp) => emp.id === filters.employeeId) || null;

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Autocomplete
        size="small"
        options={employees}
        getOptionLabel={(option) =>
          `${option.name}${option.department ? ` (${option.department})` : ""}`
        }
        value={selectedEmployee}
        onChange={(_, newValue) =>
          setFilters({ employeeId: newValue?.id || undefined })
        }
        loading={employeesLoading}
        sx={{ minWidth: 200 }}
        renderInput={(params) => (
          <TextField {...params} placeholder="All Employees" size="small" />
        )}
      />

      <Select
        size="small"
        displayEmpty
        value={filters.status ?? ""}
        onChange={(e) => setFilters({ status: e.target.value || undefined })}
        sx={{ minWidth: 140 }}
      >
        <MenuItem value="">All Statuses</MenuItem>
        {STATUSES.map((status) => (
          <MenuItem key={status} value={status}>
            {toTitleCase(status)}
          </MenuItem>
        ))}
      </Select>

      {!isSmallScreen && (
        <Select
          size="small"
          displayEmpty
          value={filters.category ?? ""}
          onChange={(e) =>
            setFilters({ category: e.target.value || undefined })
          }
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {CATEGORIES.map((category) => (
            <MenuItem key={category} value={category}>
              {toTitleCase(category)}
            </MenuItem>
          ))}
        </Select>
      )}

      {isLargeScreen && (
        <Select
          size="small"
          displayEmpty
          value={filters.priority ?? ""}
          onChange={(e) =>
            setFilters({ priority: e.target.value || undefined })
          }
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All Priorities</MenuItem>
          {PRIORITIES.map((priority) => (
            <MenuItem key={priority} value={priority}>
              {toTitleCase(priority)}
            </MenuItem>
          ))}
        </Select>
      )}
    </Stack>
  );
}

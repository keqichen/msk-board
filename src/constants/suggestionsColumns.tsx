// constants/suggestionsColumns.tsx
import { Chip } from "@mui/material";
import { type GridColDef, type GridRenderCellParams } from "@mui/x-data-grid";
import { getStatusColor } from "./suggestions";
import type { Suggestion } from "../gql/generated";
import { toTitleCase } from "../utils/stringUtils";

export interface ColumnVisibility {
  employeeName: boolean;
  description: boolean;
  category: boolean;
  source: boolean;
  status: boolean;
  priority: boolean;
  dateCreated: boolean;
  notes: boolean;
}

export const DEFAULT_COLUMN_VISIBILITY: ColumnVisibility = {
  employeeName: true,
  description: true,
  category: true,
  source: true,
  status: true,
  priority: true,
  dateCreated: true,
  notes: false, // Hidden by default
};

export const COLUMN_LABELS: Record<keyof ColumnVisibility, string> = {
  employeeName: "Employee",
  description: "Suggestion",
  category: "Category",
  source: "Source",
  status: "Status",
  priority: "Priority",
  dateCreated: "Created",
  notes: "Notes",
};

// Responsive column rules
export const MOBILE_VISIBLE_COLUMNS = ["employeeName", "description", "status"];
export const TABLET_HIDDEN_COLUMNS = ["source", "priority", "notes"];

export const suggestionsColumns = [
  {
    field: "employeeName",
    headerName: "Employee",
    flex: 1,
    minWidth: 120,
  },
  {
    field: "description",
    headerName: "Suggestion",
    flex: 2,
    minWidth: 200,
  },
  {
    field: "category",
    headerName: "Category",
    flex: 0.8,
    minWidth: 120,
    renderCell: ({ value }: GridRenderCellParams<Suggestion>) => (
      <Chip label={toTitleCase(value)} size="small" />
    ),
  },
  {
    field: "source",
    headerName: "Source",
    flex: 0.6,
    minWidth: 100,
    renderCell: ({ value }: GridRenderCellParams<Suggestion>) => (
      <Chip label={toTitleCase(value)} variant="outlined" size="small" />
    ),
  },
  {
    field: "status",
    headerName: "Status",
    flex: 0.8,
    minWidth: 130,
    renderCell: ({ value }: GridRenderCellParams<Suggestion>) => (
      <Chip
        label={toTitleCase(value)}
        color={getStatusColor(value)}
        size="small"
      />
    ),
  },
  {
    field: "priority",
    headerName: "Priority",
    type: "string" as const,
    flex: 0.6,
    minWidth: 100,
    renderCell: ({ value }: GridRenderCellParams<Suggestion>) =>
      toTitleCase(value || ""),
  },
  {
    field: "dateCreated",
    headerName: "Created",
    type: "string" as const,
    flex: 0.9,
    minWidth: 140,
    renderCell: ({ value }: GridRenderCellParams<Suggestion>) => {
      if (!value) return "";
      const date = new Date(value);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    },
  },
  {
    field: "notes",
    headerName: "Notes",
    type: "string" as const,
    flex: 1,
    minWidth: 140,
  },
];

export const filterVisibleColumns = (
  columns: GridColDef[],
  columnVisibility: ColumnVisibility,
  isMobile: boolean,
  isTablet: boolean,
  isDesktop: boolean
): GridColDef[] => {
  return columns.filter((col) => {
    // Apply responsive hiding rules
    if (isMobile) {
      if (!MOBILE_VISIBLE_COLUMNS.includes(col.field)) return false;
    } else if (isTablet && !isDesktop) {
      if (TABLET_HIDDEN_COLUMNS.includes(col.field)) return false;
    }

    // Apply user's column visibility preference
    return columnVisibility[col.field as keyof ColumnVisibility] !== false;
  });
};

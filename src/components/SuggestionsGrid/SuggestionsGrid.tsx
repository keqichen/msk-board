import * as React from "react";
import {
  gridClasses,
  type GridRenderCellParams,
  type GridRowSelectionModel,
} from "@mui/x-data-grid";
import { DataGridPro } from "@mui/x-data-grid-pro";
import {
  Stack,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import {
  MoreHoriz as MoreHorizIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";

import {
  SuggestionsDocument,
  BatchUpdateSuggestionStatusDocument,
  SuggestionStatus,
  type Suggestion,
} from "../../gql/generated";
import { useBoardStore } from "../../store/useBoardStore";
import SuggestionsFilterBar from "./SuggestionsFilterBar";
import SuggestionsGridFooter, {
  type SuggestionsGridFooterProps,
} from "./SuggestionsGridFooter";
import useOpen from "../../hooks/useOpen";
import { useState, useCallback, useMemo } from "react";
import {
  filterVisibleColumns,
  suggestionsColumns,
} from "../../constants/suggestionsColumns";
import useResponsive from "../../hooks/useResponsive";
import ColumnVisibilityConfiguration from "./ColumnVisibilityConfiguration";

// Lazy load modals
const BulkAssignModal = React.lazy(() => import("../Modals/BulkAssignModal"));

type SuggestionsGridProps = {
  onEdit: (suggestion: Suggestion) => void;
};

const SuggestionsGrid = ({ onEdit }: SuggestionsGridProps) => {
  const { isSmallScreen, isMediumScreen, isLargeScreen } = useResponsive();

  const {
    isVisible: isBulkModalOpen,
    open: openBulkModal,
    close: closeBulkModal,
  } = useOpen();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuSuggestion, setMenuSuggestion] = useState<Suggestion | null>(null);

  // MUI DataGrid Pro uses {type: 'include' | 'exclude', ids: Set}
  const [selection, setSelection] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

  const [targetStatus, setTargetStatus] = useState<SuggestionStatus>(
    SuggestionStatus.InProgress
  );

  // Get state from Zustand store
  const {
    filters,
    setFilters,
    columnVisibility,
    toggleColumn,
    showNotification,
  } = useBoardStore();

  const { data, loading } = useQuery(SuggestionsDocument, {
    variables: filters,
  });

  const [batchUpdate] = useMutation(BatchUpdateSuggestionStatusDocument);

  const handleEdit = useCallback(
    (suggestion: Suggestion) => {
      onEdit(suggestion);
      setAnchorEl(null);
      setMenuSuggestion(null);
    },
    [onEdit]
  );

  const handleMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>, suggestion: Suggestion) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
      setMenuSuggestion(suggestion);
    },
    []
  );

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setMenuSuggestion(null);
  }, []);

  // Helper to get selected IDs from the selection model
  const getSelectedIds = useCallback((): string[] => {
    if (selection.type === "exclude") {
      // When "Select All" is clicked, MUI only tracks which rows to EXCLUDE
      // So we manually get ALL row IDs from the data, then remove excluded ones
      const allIds = (data?.suggestions ?? []).map((s) => s.id);
      return allIds.filter((id) => !selection.ids.has(id));
    } else {
      // Normal selection: MUI tracks which rows are INCLUDED
      // Just return the IDs that are in the Set
      return Array.from(selection.ids).map(String);
    }
  }, [selection, data]);

  // Helper to get selection count
  const getSelectionCount = useCallback((): number => {
    if (selection.type === "exclude") {
      const totalRows = data?.suggestions.length ?? 0;
      return totalRows - selection.ids.size;
    }
    return selection.ids.size;
  }, [selection, data]);

  // Add actions column
  const columnsWithActions = useMemo(
    () => [
      ...suggestionsColumns,
      {
        field: "actions",
        headerName: "",
        width: 80,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: ({ row }: GridRenderCellParams<Suggestion>) => (
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, row)}
            color="default"
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        ),
      },
    ],
    [handleMenuOpen]
  );

  // Filter visible columns based on user preferences and screen size
  const visibleColumns = useMemo(
    () => [
      ...filterVisibleColumns(
        suggestionsColumns,
        columnVisibility,
        isSmallScreen,
        isMediumScreen,
        isLargeScreen
      ),
      // Always show actions column
      columnsWithActions[columnsWithActions.length - 1],
    ],
    [
      columnVisibility,
      isSmallScreen,
      isMediumScreen,
      isLargeScreen,
      columnsWithActions,
    ]
  );

  const handleBatchUpdate = useCallback(async () => {
    const selectedIds = getSelectedIds();

    if (selectedIds.length === 0) return;

    const items = selectedIds.map((id) => ({
      id: String(id),
      status: targetStatus,
    }));

    await batchUpdate({
      variables: { items },
      optimisticResponse: {
        batchUpdateSuggestionStatus: items.map((item) => ({
          __typename: "Suggestion",
          id: item.id,
          status: item.status,
          dateUpdated: new Date().toISOString(),
          dateCompleted:
            item.status === SuggestionStatus.Completed
              ? new Date().toISOString()
              : null,
        })),
      },
      update(cache, { data }) {
        data?.batchUpdateSuggestionStatus.forEach(({ id, status }) => {
          cache.modify({
            id: cache.identify({ __typename: "Suggestion", id }),
            fields: { status: () => status },
          });
        });
      },
    });

    setSelection({
      type: "include",
      ids: new Set(),
    } as unknown as GridRowSelectionModel);
    showNotification(`Successfully updated ${items.length} suggestion(s)`);
  }, [getSelectedIds, targetStatus, batchUpdate, showNotification]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 100px)",
        minHeight: "600px",
        width: "100%",
        p: 2,
      }}
    >
      <Stack gap={1.5} sx={{ flex: 1, minHeight: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ flex: 1 }}>
            <SuggestionsFilterBar filters={filters} setFilters={setFilters} />
          </Box>

          {!isSmallScreen && (
            <ColumnVisibilityConfiguration
              columnVisibility={columnVisibility}
              onToggleColumn={toggleColumn}
            />
          )}
        </Stack>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <DataGridPro
            rows={data?.suggestions ?? []}
            columns={visibleColumns}
            getRowId={(row) => row.id}
            loading={loading}
            checkboxSelection
            disableColumnMenu
            rowSelectionModel={selection}
            onRowSelectionModelChange={(model) => {
              setSelection(model);
            }}
            pageSizeOptions={[25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 50, page: 0 } },
              sorting: { sortModel: [{ field: "dateCreated", sort: "desc" }] },
              pinnedColumns: { right: ["actions"] },
            }}
            sx={{
              height: "100%",
              width: "100%",
              [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                outline: "transparent",
              },
              [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
                {
                  outline: "none",
                },
            }}
            slots={{
              footer: SuggestionsGridFooter,
            }}
            slotProps={{
              footer: {
                onBulkAssignClick: openBulkModal,
              } as Partial<SuggestionsGridFooterProps>,
            }}
          />
        </Box>
      </Stack>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={() => menuSuggestion && handleEdit(menuSuggestion)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
      </Menu>

      {/* Bulk Update Modal */}
      <React.Suspense fallback={null}>
        {isBulkModalOpen && (
          <BulkAssignModal
            open={isBulkModalOpen}
            onClose={closeBulkModal}
            selectionCount={getSelectionCount()}
            targetStatus={targetStatus}
            setTargetStatus={setTargetStatus}
            onConfirm={handleBatchUpdate}
          />
        )}
      </React.Suspense>
    </Box>
  );
};

export default SuggestionsGrid;

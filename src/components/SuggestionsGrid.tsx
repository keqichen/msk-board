import * as React from "react";
import {
  gridClasses,
  type GridRenderCellParams,
  type GridRowSelectionModel,
} from "@mui/x-data-grid";
import { DataGridPro } from "@mui/x-data-grid-pro";
import {
  Stack,
  Snackbar,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
  Popover,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
} from "@mui/material";
import {
  MoreHoriz as MoreHorizIcon,
  Edit as EditIcon,
  ViewColumn as ViewColumnIcon,
} from "@mui/icons-material";
import { useMutation, useQuery } from "@apollo/client/react";

import {
  SuggestionsDocument,
  BatchUpdateSuggestionStatusDocument,
  SuggestionStatus,
  type Suggestion,
} from "../gql/generated";
import { useBoardStore } from "../store/useBoardStore";
import SuggestionsFilterBar from "./SuggestionsFilterBar";
import SuggestionsGridFooter from "./SuggestionsGridFooter";
import useOpen from "../hooks/useOpen";
import { useState, useCallback, useMemo } from "react";
import {
  filterVisibleColumns,
  COLUMN_LABELS,
  type ColumnVisibility,
  suggestionsColumns,
} from "../constants/suggestionsColumns";
import useResponsive from "../hooks/useResponsive";

// Lazy load modals
const BulkAssignModal = React.lazy(() => import("./Modals/BulkAssignModal"));
const SuggestionModal = React.lazy(() => import("./Modals/SuggestionModal"));

type SuggestionsGridProps = {
  isSuggestionModalOpen: boolean;
  openSuggestionModal: () => void;
  closeSuggestionModal: () => void;
};

const SuggestionsGrid = ({
  isSuggestionModalOpen,
  openSuggestionModal,
  closeSuggestionModal,
}: SuggestionsGridProps) => {
  const { isSmallScreen, isMediumScreen, isLargeScreen } = useResponsive();

  const {
    isVisible: isBulkModalOpen,
    open: openBulkModal,
    close: closeBulkModal,
  } = useOpen();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<Suggestion | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuSuggestion, setMenuSuggestion] = useState<Suggestion | null>(null);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(
    null
  );

  const [selection, setSelection] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

  const [targetStatus, setTargetStatus] = useState<SuggestionStatus>(
    SuggestionStatus.InProgress
  );

  // Get state from Zustand store
  const { filters, setFilters, columnVisibility, toggleColumn } =
    useBoardStore();

  const { data, loading } = useQuery(SuggestionsDocument, {
    variables: filters,
  });

  const [batchUpdate] = useMutation(BatchUpdateSuggestionStatusDocument);

  const handleEdit = useCallback(
    (suggestion: Suggestion) => {
      setSelectedSuggestion(suggestion);
      openSuggestionModal();
      setAnchorEl(null);
      setMenuSuggestion(null);
    },
    [openSuggestionModal]
  );

  const handleCreate = useCallback(() => {
    setSelectedSuggestion(null);
    openSuggestionModal();
  }, [openSuggestionModal]);

  const handleModalClose = useCallback(() => {
    closeSuggestionModal();
    setSelectedSuggestion(null);
  }, [closeSuggestionModal]);

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

  const handleColumnMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setColumnMenuAnchor(event.currentTarget);
  };

  const handleColumnMenuClose = () => {
    setColumnMenuAnchor(null);
  };

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
    if (selection.ids.size === 0) return;

    const items = Array.from(selection.ids).map((id) => ({
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

    setSelection({ type: "include", ids: new Set() });
    setSuccessMessage(`Successfully updated ${items.length} suggestion(s)`);
  }, [selection, targetStatus, batchUpdate]);

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
            <SuggestionsFilterBar
              filters={filters}
              setFilters={setFilters}
              onAddClick={handleCreate}
            />
          </Box>

          {!isSmallScreen && (
            <Button
              variant="outlined"
              startIcon={<ViewColumnIcon />}
              onClick={handleColumnMenuOpen}
              size="medium"
              sx={{
                height: "fit-content",
                textTransform: "none",
                minWidth: "100px",
              }}
            >
              Columns
            </Button>
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
            onRowSelectionModelChange={(model) => setSelection(model)}
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
              footer: () => (
                <SuggestionsGridFooter onBulkAssignClick={openBulkModal} />
              ),
            }}
          />
        </Box>
      </Stack>

      {/* Column Visibility Menu */}
      <Popover
        open={Boolean(columnMenuAnchor)}
        anchorEl={columnMenuAnchor}
        onClose={handleColumnMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Show Columns
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Stack spacing={0.5}>
            {(
              Object.keys(columnVisibility) as Array<keyof ColumnVisibility>
            ).map((field) => (
              <FormControlLabel
                key={field}
                control={
                  <Checkbox
                    checked={columnVisibility[field]}
                    onChange={() => toggleColumn(field)}
                    size="small"
                  />
                }
                label={COLUMN_LABELS[field]}
                sx={{ ml: 0 }}
              />
            ))}
          </Stack>
        </Box>
      </Popover>

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
            selectionCount={selection.ids.size}
            targetStatus={targetStatus}
            setTargetStatus={setTargetStatus}
            onConfirm={handleBatchUpdate}
          />
        )}
      </React.Suspense>

      {/* Create/Edit Suggestion Modal */}
      <React.Suspense fallback={null}>
        {isSuggestionModalOpen && (
          <SuggestionModal
            open={isSuggestionModalOpen}
            onClose={handleModalClose}
            filters={filters}
            suggestion={selectedSuggestion}
            onSuccess={() => {
              setSuccessMessage(
                selectedSuggestion
                  ? "Suggestion updated successfully!"
                  : "Suggestion created successfully!"
              );
            }}
          />
        )}
      </React.Suspense>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessMessage(null)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SuggestionsGrid;

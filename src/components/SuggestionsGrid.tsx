import * as React from "react";
import {
  DataGrid,
  gridClasses,
  type GridColDef,
  type GridRowSelectionModel,
} from "@mui/x-data-grid";
import {
  Chip,
  Stack,
  Snackbar,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
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
} from "../gql/generated";
import { useBoardStore } from "../store/useBoardStore";
import SuggestionsFilterBar from "./SuggestionsFilterBar";
import SuggestionsGridFooter from "./SuggestionsGridFooter";
import { getStatusColor } from "../constants/suggestions";
import useOpen from "../hooks/useOpen";
import { useState, useCallback } from "react";

// Lazy load modals
const BulkAssignModal = React.lazy(() => import("./BulkAssignModal"));
const SuggestionModal = React.lazy(() => import("./SuggestionModal"));

const SuggestionsGrid = () => {
  const {
    isVisible: isBulkModalOpen,
    open: openBulkModal,
    close: closeBulkModal,
  } = useOpen();

  const {
    isVisible: isSuggestionModalOpen,
    open: openSuggestionModal,
    close: closeSuggestionModal,
  } = useOpen();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<Suggestion | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuSuggestion, setMenuSuggestion] = useState<Suggestion | null>(null);

  const [selection, setSelection] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

  const [targetStatus, setTargetStatus] = useState<SuggestionStatus>(
    SuggestionStatus.InProgress
  );

  const { filters, setFilters } = useBoardStore();

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

  const columns: GridColDef[] = [
    { field: "employeeName", headerName: "Employee", flex: 1, minWidth: 180 },
    {
      field: "description",
      headerName: "Suggestion",
      flex: 1.4,
      minWidth: 220,
    },
    {
      field: "category",
      headerName: "Category",
      width: 140,
      renderCell: ({ value }) => <Chip label={value} size="small" />,
    },
    {
      field: "source",
      headerName: "Source",
      width: 110,
      renderCell: ({ value }) => (
        <Chip label={value} variant="outlined" size="small" />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: ({ value }) => (
        <Chip label={value} color={getStatusColor(value)} size="small" />
      ),
    },
    {
      field: "dateCreated",
      headerName: "Created",
      type: "string",
      width: 170,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: ({ row }) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, row)}
          color="default"
        >
          <MoreHorizIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

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
    <Stack gap={1.5} sx={{ height: "80vh" }}>
      <SuggestionsFilterBar
        filters={filters}
        setFilters={setFilters}
        onAddClick={handleCreate}
      />

      <DataGrid
        rows={data?.suggestions ?? []}
        columns={columns}
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
        }}
        sx={{
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
            <SuggestionsGridFooter
              selectionCount={selection.ids.size}
              onBulkAssignClick={openBulkModal}
            />
          ),
        }}
      />

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
    </Stack>
  );
};

export default SuggestionsGrid;

import * as React from "react";
import {
  DataGrid,
  type GridColDef,
  type GridRowSelectionModel,
} from "@mui/x-data-grid";
import { Chip, Stack, Snackbar, Alert } from "@mui/material";
import { useMutation, useQuery } from "@apollo/client/react";

import {
  SuggestionsDocument,
  BatchUpdateSuggestionStatusDocument,
  SuggestionStatus,
} from "../gql/generated";
import { useBoardStore } from "../store/useBoardStore";
import SuggestionsFilterBar from "./SuggestionsFilterBar";
import SuggestionsGridFooter from "./SuggestionsGridFooter";
import { getStatusColor } from "../constants/suggestions";
import useOpen from "../hooks/useOpen";
import { useState } from "react";

// Lazy load modals
const BulkAssignModal = React.lazy(() => import("./BulkAssignModal"));
const CreateSuggestionModal = React.lazy(
  () => import("./CreateSuggestionModal")
);

const SuggestionsGrid = () => {
  const {
    isVisible: isBulkModalOpen,
    open: openBulkModal,
    close: closeBulkModal,
  } = useOpen();

  const {
    isVisible: isCreateModalOpen,
    open: openCreateModal,
    close: closeCreateModal,
  } = useOpen();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
  ];

  const handleBatchUpdate = async () => {
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
  };

  return (
    <Stack gap={1.5} sx={{ height: "80vh" }}>
      <SuggestionsFilterBar
        filters={filters}
        setFilters={setFilters}
        onAddClick={openCreateModal}
      />

      <DataGrid
        rows={data?.suggestions ?? []}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        checkboxSelection
        disableRowSelectionOnClick
        rowSelectionModel={selection}
        onRowSelectionModelChange={(model) => setSelection(model)}
        pageSizeOptions={[25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 50, page: 0 } },
          sorting: { sortModel: [{ field: "dateCreated", sort: "desc" }] },
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

      {/* Create Suggestion Modal */}
      <React.Suspense fallback={null}>
        {isCreateModalOpen && (
          <CreateSuggestionModal
            open={isCreateModalOpen}
            onClose={closeCreateModal}
            filters={filters}
            onSuccess={() => {
              setSuccessMessage("Suggestion created successfully!");
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

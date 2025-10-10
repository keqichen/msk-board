import * as React from "react";
import {
  DataGrid,
  type GridColDef,
  type GridRowSelectionModel,
} from "@mui/x-data-grid";
import { Chip, Stack } from "@mui/material";
import { useMutation, useQuery } from "@apollo/client/react";

import {
  SuggestionsDocument,
  BatchUpdateSuggestionStatusDocument,
  SuggestionStatus,
} from "../gql/generated";
import { useBoardStore } from "../store/useBoardStore";
import SuggestionsFilterBar from "./SuggestionsFilterBar";
import { useState } from "react";
import SuggestionsGridFooter from "./SuggestionsGridFooter";
import BulkAssignModal from "./BulkAssignModal";

const SuggestionsGrid = () => {
  const { filters, setFilters, targetStatus, setTargetStatus } =
    useBoardStore();

  const [selection, setSelection] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });
  const [dialogOpen, setDialogOpen] = useState(false);

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
      renderCell: ({ value }) => {
        const color =
          value === SuggestionStatus.Completed
            ? "success"
            : value === SuggestionStatus.InProgress
              ? "info"
              : value === SuggestionStatus.Dismissed
                ? "default"
                : "warning";
        return <Chip label={value} color={color} size="small" />;
      },
    },
    {
      field: "dateCreated",
      headerName: "Created",
      type: "string",
      width: 170,
    },
  ];

  const onBatchChange = async () => {
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
  };

  return (
    <Stack gap={1.5} sx={{ height: "80vh" }}>
      <SuggestionsFilterBar
        filters={filters}
        setFilters={setFilters}
        targetStatus={targetStatus}
        setTargetStatus={setTargetStatus}
        selectionCount={selection.ids.size}
        onBatchChange={onBatchChange}
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
          sorting: { sortModel: [{ field: "createdAt", sort: "desc" }] },
        }}
        slots={{
          footer: () => (
            <SuggestionsGridFooter
              selectionCount={selection.ids.size}
              onBulkAssignClick={() => setDialogOpen(true)}
            />
          ),
        }}
      />

      <BulkAssignModal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        selectionCount={selection.ids.size}
        targetStatus={targetStatus}
        setTargetStatus={setTargetStatus}
        onConfirm={onBatchChange}
      />
    </Stack>
  );
};

export default SuggestionsGrid;

import * as React from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Chip, Stack } from "@mui/material";
import { useMutation, useQuery } from "@apollo/client/react";

import {
  SuggestionsDocument,
  BatchUpdateSuggestionStatusDocument,
  SuggestionStatus,
} from "../gql/generated";
import { useBoardStore } from "../store/useBoardStore";
import SuggestionsFilterBar from "./SuggestionsFilterBar";

export default function SuggestionsGrid() {
  const {
    filters,
    setFilters,
    selection,
    setSelection,
    targetStatus,
    setTargetStatus,
  } = useBoardStore();

  const { data, loading } = useQuery(SuggestionsDocument, {
    variables: filters,
  });

  const [batchUpdate] = useMutation(BatchUpdateSuggestionStatusDocument);

  const columns: GridColDef[] = [
    { field: "employeeName", headerName: "Employee", flex: 1, minWidth: 180 },
    { field: "title", headerName: "Suggestion", flex: 1.4, minWidth: 220 },
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
      field: "createdAt",
      headerName: "Created",
      type: "dateTime",
      width: 170,
    },
  ];

  const onBatchChange = async () => {
    if (!selection.length) return;

    const items = selection.map((id) => ({
      id,
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

    setSelection([]);
  };

  return (
    <Stack gap={1.5} sx={{ height: "80vh" }}>
      <SuggestionsFilterBar
        filters={filters}
        setFilters={setFilters}
        targetStatus={targetStatus}
        setTargetStatus={setTargetStatus}
        selectionCount={selection.length}
        onBatchChange={onBatchChange}
      />

      <DataGrid
        rows={data?.suggestions ?? []}
        columns={columns}
        getRowId={(row) => row.id}
        loading={loading}
        checkboxSelection
        disableRowSelectionOnClick
        // rowSelectionModel={selection}
        // onRowSelectionModelChange={(model) => setSelection(model as string[])}
        pageSizeOptions={[25, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 50, page: 0 } },
          sorting: { sortModel: [{ field: "createdAt", sort: "desc" }] },
        }}
      />
    </Stack>
  );
}

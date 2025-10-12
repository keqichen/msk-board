import { Box } from "@mui/material";
import SuggestionsHeader from "./SuggestionsHeader";
import SuggestionsGrid from "./SuggestionsGrid";
import useOpen from "../hooks/useOpen";
import { useState, useCallback, lazy, Suspense } from "react";
import { useBoardStore } from "../store/useBoardStore";
import type { Suggestion } from "../gql/generated";

// Lazy load the modal
const SuggestionModal = lazy(() => import("./Modals/SuggestionModal"));

const SuggestionsBoard = () => {
  const { filters } = useBoardStore();
  const {
    isVisible: isSuggestionModalOpen,
    open: openSuggestionModal,
    close: closeSuggestionModal,
  } = useOpen();

  const [selectedSuggestion, setSelectedSuggestion] =
    useState<Suggestion | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCreate = useCallback(() => {
    setSelectedSuggestion(null);
    openSuggestionModal();
  }, [openSuggestionModal]);

  const handleEdit = useCallback(
    (suggestion: Suggestion) => {
      setSelectedSuggestion(suggestion);
      openSuggestionModal();
    },
    [openSuggestionModal]
  );

  const handleModalClose = useCallback(() => {
    closeSuggestionModal();
    setSelectedSuggestion(null);
  }, [closeSuggestionModal]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      sx={{ pt: 3 }}
      justifyContent="space-between"
    >
      <SuggestionsHeader onAddClick={handleCreate} />
      <SuggestionsGrid
        onEdit={handleEdit}
        successMessage={successMessage}
        setSuccessMessage={setSuccessMessage}
      />

      {/* Lazy load Suggestion Modal */}
      <Suspense fallback={null}>
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
      </Suspense>
    </Box>
  );
};

export default SuggestionsBoard;

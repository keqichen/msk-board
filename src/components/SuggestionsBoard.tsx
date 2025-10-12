import { Box } from "@mui/material";
import SuggestionsHeader from "./SuggestionsHeader";
import SuggestionsGrid from "./SuggestionsGrid";
import useOpen from "../hooks/useOpen";

const SuggestionsBoard = () => {
  const {
    isVisible: isSuggestionModalOpen,
    open: openSuggestionModal,
    close: closeSuggestionModal,
  } = useOpen();

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100vh"
      sx={{ pt: 3 }}
      justifyContent="space-between"
    >
      <SuggestionsHeader onAddClick={openSuggestionModal} />
      <SuggestionsGrid
        isSuggestionModalOpen={isSuggestionModalOpen}
        openSuggestionModal={openSuggestionModal}
        closeSuggestionModal={closeSuggestionModal}
      />
    </Box>
  );
};

export default SuggestionsBoard;

import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "./apollo/client";
import SuggestionsGrid from "./components/SuggestionsGrid";
import Container from "@mui/material/Container";

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <h1>MSK Suggestion Board</h1>
        <SuggestionsGrid />
      </Container>
    </ApolloProvider>
  );
}

import { ApolloProvider } from "@apollo/client/react";
import { apolloClient } from "./apollo/client";
import Container from "@mui/material/Container";
import SuggestionsBoard from "./components/SuggestionsBoard";

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <Container maxWidth="lg">
        <SuggestionsBoard />
      </Container>
    </ApolloProvider>
  );
}

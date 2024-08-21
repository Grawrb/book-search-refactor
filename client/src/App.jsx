import "./App.css";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

// Get the GraphQL endpoint from environment variables
const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_GRAPHQL_ENDPOINT || "http://localhost:3001/graphql";


const httpLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT,
});

// Attaches JWT token to every request as `authorization` header.
const authLink = setContext((_, { headers }) => {
  // Get authentication token from local storage
  const token = localStorage.getItem("id_token");
  // Return headers to context
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Define custom cache with merge function
const cache = new InMemoryCache({
  typePolicies: {
    User: {
      fields: {
        savedBooks: {
          merge(existing = [], incoming = []) {
            const existingBooks = new Map(
              existing.map((book) => [book.bookId, book])
            );
            const incomingBooks = new Map(
              incoming.map((book) => [book.bookId, book])
            );

            // Combine books, overwriting previous data if conflicts
            return [...existingBooks.values(), ...incomingBooks.values()];
          },
        },
      },
    },
  },
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Navbar />
      <Outlet />
    </ApolloProvider>
  );
}

export default App;
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

// Construct our main GraphQL API endpoint.
const httpLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT,
});

// Construct request middleware that will attach the JWT token to every request as an `authorization` header.
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists.
  const token = localStorage.getItem("id_token");
  // Return the headers to the context so httpLink can read them.
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Define the custom cache with merge function.
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

            // Combine the books, favoring incoming data in case of conflicts.
            return [...existingBooks.values(), ...incomingBooks.values()];
          },
        },
      },
    },
  },
});

// Create Apollo Client instance with the custom cache.
const client = new ApolloClient({
  // Set up our client to execute the `authLink` middleware prior to making the request to our GraphQL API.
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
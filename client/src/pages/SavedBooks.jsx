// Import useState, and useEffect from React.
import { useState, useEffect } from "react";
// Import the Container, Card, Button, Row, and Col components from React Bootstrap.
import { Container, Card, Button, Row, Col } from "react-bootstrap";
// Import the useMutation and useApolloClient hooks from @apollo/client.
import { useMutation, useApolloClient } from "@apollo/client";
// Import the REMOVE_BOOK from the mutations file.
import { REMOVE_BOOK } from "../utils/mutations";
// Import the GET_ME query from the queries file.
import { GET_ME } from "../utils/queries";
// Import the Auth service.
import Auth from "../utils/auth";
// Import the removeBookId function from the localStorage file.
import { removeBookId } from "../utils/localStorage";
// Define the SavedBooks functional component.
const SavedBooks = () => {
  // Set the userData state using the useState hook.
  const [userData, setUserData] = useState({});
  // Define the removeBook mutation.
  const [removeBook, { error }] = useMutation(REMOVE_BOOK);
  // Define the client variable using the useApolloClient hook.
  const client = useApolloClient();
  // Use this to determine if `useEffect()` hook needs to run again.
  const userDataLength = Object.keys(userData).length;
  // Use the useEffect hook to automatically run the GET_ME query on load.
  useEffect(() => {
    // Define the getUserData function.
    const getUserData = async () => {
      // Try block to execute the GET_ME query.
      try {
        const token = Auth.loggedIn() ? Auth.getToken() : null;
        // Conditionally return if no token is found.
        if (!token) {
          return;
        }
        // Perform the query directly with Apollo Client
        const { data, errors } = await client.query({
          query: GET_ME,
          context: {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        });
        // Check for errors.
        if (errors) {
          throw new Error("something went wrong!");
        }
        // Update the userData state.
        setUserData(data.me);
      } catch (err) {
        console.error(err); // Correct variable
      }
    };
    // Call the getUserData function.
    getUserData();
    // Add "userDataLength" for the dependency array, and "client" as a dependency.
  }, [userDataLength, client]);
  // Create function that accepts the book's mongo _id value as param and deletes the book from the database.
  const handleDeleteBook = async (bookId) => {
    // Get token from Auth service.
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    // If no token is found, return false.
    if (!token) {
      return false;
    }
    // Try block to execute the mutation.
    try {
      // Execute the mutation using the removeBook() function, and passing the bookId as the variables.
      const { data } = await removeBook({
        variables: { bookId },
      });
      // Check for errors.
      if (data.errors) {
        throw new Error("Something went wrong during deletion.");
      }
      // Update userData state with previous data, filtering out the book to be deleted.
      setUserData((prevData) => ({
        ...prevData,
        savedBooks: prevData.savedBooks.filter(
          (book) => book.bookId !== bookId
        ),
      }));
      // Remove book ID from localStorage.
      removeBookId(bookId);
    } catch (err) {
      console.error("Error during deletion:", error);
      alert("An error occurred while deleting the book. Please try again.");
    }
  };
  // If data isn't here yet, say so.
  if (!userDataLength) {
    return <h2>LOADING...</h2>;
  }
  // Return the JSX for the SavedBooks component.
  return (
    <>
      <Container fluid className="text-light bg-dark p-5">
        <h1>Viewing saved books!</h1>
      </Container>
      <Container>
        <h2 className="pt-5">
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? "book" : "books"
              }:`
            : "You have no saved books!"}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => (
            <Col key={book.bookId} md="4">
              <Card border="dark">
                {book.image ? (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant="top"
                  />
                ) : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors.join(", ")}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button
                    className="btn-block btn-danger"
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
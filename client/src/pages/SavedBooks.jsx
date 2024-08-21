// Import necessary functions and components
import { useState, useEffect } from "react";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import { useMutation, useApolloClient } from "@apollo/client";
import { REMOVE_BOOK } from "../utils/mutations";
import { GET_ME } from "../utils/queries";
import Auth from "../utils/auth";
import { removeBookId } from "../utils/localStorage";

const SavedBooks = () => {
  // Set userData state 
  const [userData, setUserData] = useState({});
  const [removeBook, { error }] = useMutation(REMOVE_BOOK);
  const client = useApolloClient();
  const userDataLength = Object.keys(userData).length;
  // useEffect hook automatically runs GET_ME query on page load
  useEffect(() => {
    const getUserData = async () => {

      try {
        const token = Auth.loggedIn() ? Auth.getToken() : null;

        if (!token) {
          return;
        }
        // Perform query with Apollo Client
        const { data, errors } = await client.query({
          query: GET_ME,
          context: {
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        });
        if (errors) {
          throw new Error("something went wrong!");
        }
        // Update userData state
        setUserData(data.me);
      } catch (err) {
        console.error(err);
      }
    };
  
    getUserData();
    
  }, [userDataLength, client]);
 
  const handleDeleteBook = async (bookId) => {
    // Get token from Auth service
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    // If no token found, return false
    if (!token) {
      return false;
    }
  
    try {
      // Mutation uses removeBook() function, passes bookId as variable
      const { data } = await removeBook({
        variables: { bookId },
      });
  
      if (data.errors) {
        throw new Error("Something went wrong during deletion.");
      }
      // Update userData state with previous data, filtering out the book to be deleted
      setUserData((prevData) => ({
        ...prevData,
        savedBooks: prevData.savedBooks.filter(
          (book) => book.bookId !== bookId
        ),
      }));
      // Remove book ID from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error("Error during deletion:", error);
      alert("An error occurred while deleting the book. Please try again.");
    }
  };
  if (!userDataLength) {
    return <h2>LOADING...</h2>;
  }
  // Return JSX for SavedBooks component
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
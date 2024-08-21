// Import useState from react to use state in the SearchBooks component and set the initial state of the searchedBooks and searchInput variables.
import { useState } from "react";
// Import the useQuery and useMutation hooks from @apollo/client to make requests to the GraphQL server.
import { useQuery, useMutation } from "@apollo/client";
// Import the GET_ME and SAVE_BOOK queries from the queries file.
import { Container, Col, Form, Button, Card, Row } from "react-bootstrap";
// Import GET_ME from the queries file.
import { GET_ME } from "../utils/queries";
// Import SAVE_BOOK from the mutations file.
import { SAVE_BOOK } from "../utils/mutations";
// Import the Auth service.
import Auth from "../utils/auth";
// Import the searchGoogleBooks function from the API file.
import { searchGoogleBooks } from "../utils/API";
// Define the SearchBooks functional component.
const SearchBooks = () => {
  // Set the initial state of the searchedBooks and searchInput variables using the useState hook.
  const [searchedBooks, setSearchedBooks] = useState([]);
  // Set the initial state of the searchInput variable using the useState hook.
  const [searchInput, setSearchInput] = useState("");
  // Use the useQuery hook to make the GET_ME query request.
  const { data, refetch } = useQuery(GET_ME);
  // Use optional chaining to check if data exists.
  const savedBookIds = data?.me?.savedBooks.map((book) => book.bookId) || [];
  // Define the saveBook mutation.
  const [saveBook] = useMutation(SAVE_BOOK, {
    // Add the onCompleted option to the saveBook mutation to refetch the GET_ME query after the mutation is complete.
    onCompleted: () => {
      refetch();
    },
  });
  // Define the handleFormSubmit function with the event parameter.
  const handleFormSubmit = async (event) => {
    // Prevent the default form submission behavior.
    event.preventDefault();
    // Check if the searchInput variable is empty and return false if it is.
    if (!searchInput) {
      return false;
    }
    // Try block to execute the searchGoogleBooks function and pass the searchInput as the argument.
    try {
      // Execute the searchGoogleBooks function and pass the searchInput as the argument.
      const response = await searchGoogleBooks(searchInput);
      // Check if the response is not ok and throw an error if it is not.
      if (!response.ok) {
        throw new Error("something went wrong!");
      }
      // Destructure the items property from the response.json() method.
      const { items } = await response.json();
      // Map over the items array and return a new array of objects with the book data.
      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ["No author to display"],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || "",
      }));
      // Update the searchedBooks state with the bookData array.
      setSearchedBooks(bookData);
      // Clear the searchInput state.
      setSearchInput("");
    } catch (err) {
      console.error(err);
    }
  };
  // Define the handleSaveBook function with the bookId parameter.
  const handleSaveBook = async (bookId) => {
    // Find the book to save by the bookId.
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
    // Try block to execute the saveBook mutation and pass the bookToSave object as the variables.
    try {
      // Execute the saveBook mutation and pass the bookToSave object as the variables.
      await saveBook({
        // Pass the bookToSave object as the variables.
        variables: {
          authors: bookToSave.authors,
          description: bookToSave.description,
          title: bookToSave.title,
          bookId: bookToSave.bookId,
          image: bookToSave.image,
          link: bookToSave.link,
        },
      });
    } catch (err) {
      console.error("Error saving book:", err.message);
    }
  };
  // Return the JSX for the SearchBooks component.
  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name="searchInput"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="text"
                  size="lg"
                  placeholder="Search for a book"
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type="submit" variant="success" size="lg">
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className="pt-5">
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : "Search for a book to begin"}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            return (
              <Col md="4" key={book.bookId}>
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
                    <p className="small">Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {Auth.loggedIn() && (
                      <Button
                        disabled={savedBookIds?.some(
                          (savedBookId) => savedBookId === book.bookId
                        )}
                        className="btn-block btn-info"
                        onClick={() => handleSaveBook(book.bookId)}
                      >
                        {savedBookIds?.some(
                          (savedBookId) => savedBookId === book.bookId
                        )
                          ? "This book has already been saved!"
                          : "Save this Book!"}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
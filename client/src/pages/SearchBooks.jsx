// Import necessary components and functions
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Container, Col, Form, Button, Card, Row } from "react-bootstrap";
import { GET_ME } from "../utils/queries";
import { SAVE_BOOK } from "../utils/mutations";
import Auth from "../utils/auth";
import { searchGoogleBooks } from "../utils/API";

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  // useQuery hook for GET_ME query request
  const { data, refetch } = useQuery(GET_ME);
  const savedBookIds = data?.me?.savedBooks.map((book) => book.bookId) || [];
  const [saveBook] = useMutation(SAVE_BOOK, {
    // Add onCompleted option to saveBook mutation to refetch GET_ME query after mutation runs
    onCompleted: () => {
      refetch();
    },
  });

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    // Check searchInput variable. If empty, return false
    if (!searchInput) {
      return false;
    }
  
    try {
      // searchGoogleBooks function will pass searchInput as argument
      const response = await searchGoogleBooks(searchInput);
 
      if (!response.ok) {
        throw new Error("something went wrong!");
      }
      // Destructure items from response.json()
      const { items } = await response.json();
      // Map over items array and return new array of objects with book data
      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ["No author to display"],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || "",
      }));
      // Update searchedBooks state with bookData
      setSearchedBooks(bookData);
      setSearchInput("");
    } catch (err) {
      console.error(err);
    }
  };
  const handleSaveBook = async (bookId) => {
    // Find book by bookId
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);
    try {
  
      await saveBook({
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
  // Return JSX for SearchBooks component
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
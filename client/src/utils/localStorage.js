// Helper functions to interact with local storage.
// Export the getSavedBookIds, saveBookIds, and removeBookId functions.
export const getSavedBookIds = () => {
  // Get saved book IDs from local storage.
  const savedBookIds = localStorage.getItem("saved_books")
    ? // If there are no saved book IDs, return an empty array.
      JSON.parse(localStorage.getItem("saved_books"))
    : [];
  return savedBookIds;
};

export const saveBookIds = (bookIdArr) => {
  // If there are book IDs, save them to local storage.
  if (bookIdArr.length) {
    localStorage.setItem("saved_books", JSON.stringify(bookIdArr));
  } else {
    localStorage.removeItem("saved_books");
  }
};

export const removeBookId = (bookId) => {
  // Get the saved book IDs from local storage.
  const savedBookIds = localStorage.getItem("saved_books")
    ? // If there are no saved book IDs, return false.
      JSON.parse(localStorage.getItem("saved_books"))
    : null;

  if (!savedBookIds) {
    return false;
  }
  // Remove the book ID from the saved book IDs.
  const updatedSavedBookIds = savedBookIds?.filter(
    (savedBookId) => savedBookId !== bookId
  );
  // Save the updated saved book IDs to local storage.
  localStorage.setItem("saved_books", JSON.stringify(updatedSavedBookIds));

  return true;
};

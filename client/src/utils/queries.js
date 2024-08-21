import { gql } from "@apollo/client";
// Export GET_ME query for retrieving the logged-in user's information.
export const GET_ME = gql`
  {
    me {
      _id
      username
      email
      bookCount
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
    }
  }
`;
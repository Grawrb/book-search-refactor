// Define the query and mutation functionality to work with the Mongoose models.
const { User } = require("../models");
// Import the signToken function, and the AuthenticationError class from the utils folder.
const { signToken, AuthenticationError } = require("../utils/auth");
// Define the resolvers for the query me, which returns the User data for the currently logged in user.
const resolvers = {
  // Define the query functionality for the me query.
  Query: {
    // Define the me query that returns a User type.
    me: async (parent, args, context) => {
      // If the user is authenticated, return the user data.
      if (context.user) {
        // Use the User model to find a single user by their _id and return that data (excluding the password).
        const userData = await User.findOne({ _id: context.user._id })
          // Exclude the __v property from the query.
          .select("-__v -password")
          // Populate the savedBooks and return the user data.
          .populate("savedBooks");

        return userData;
      }

      throw new AuthenticationError("Not logged in");
    },
  },
  // Define the mutation functionality for the login and addUser mutations.
  Mutation: {
    // Define the login mutation that returns an Auth type.
    login: async (parent, { email, password }) => {
      // Use the User model to find a single user by their email address.
      const user = await User.findOne({ email });
      // If the user is not found, return an AuthenticationError.
      if (!user) {
        throw new AuthenticationError("Incorrect credentials");
      }
      // If the user is found, use the isCorrectPassword method on the user object to verify the user's identity.
      const correctPw = await user.isCorrectPassword(password);
      // If the password is incorrect, return an AuthenticationError.
      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }
      // If email and password are correct, sign token and return an object with token and user data.
      const token = signToken(user);
      return { token, user };
    },
    // Define the addUser mutation that returns an Auth type.
    addUser: async (parent, args) => {
      // Use the User model to create a new user using the data passed in as args.
      const user = await User.create(args);
      // Sign a token and return an object with token and user data.
      const token = signToken(user);
      // Return the token and user data.
      return { token, user };
    },
    // Define the saveBook mutation with the authors, description, title, bookId, image, and link parameters.
    saveBook: async (
      _,
      { authors, description, title, bookId, image, link },
      context
    ) => {
      // If the user is authenticated, add the book to their savedBooks array.
      try {
        if (!context.user) {
          throw new AuthenticationError("You need to be logged in!");
        }
        // Update the user to save a book.
        return await User.findByIdAndUpdate(
          context.user._id,
          // Add the book to the savedBooks array.
          {
            $addToSet: {
              savedBooks: { authors, description, title, bookId, image, link },
            },
            // New option returns the updated document.
          },
          { new: true }
        );
      } catch (error) {
        throw new Error("Error saving book");
      }
    },
    // Define the removeBook mutation with the bookId parameter.
    removeBook: async (parent, { bookId }, context) => {
      // If the user is authenticated, remove the book from their savedBooks array.
      if (context.user) {
        // Update the user to remove a book.
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        // Return the updated user.
        return updatedUser;
      }

      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
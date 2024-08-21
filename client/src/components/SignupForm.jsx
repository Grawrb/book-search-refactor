// Replace the addUser() functionality imported from the API file with the ADD_USER mutation functionality.
// Import useState from react.
import { useState } from "react";
// Import Form, Button, and Alert components from react-bootstrap.
import { Form, Button, Alert } from "react-bootstrap";
// Import the useMutation hook from the @apollo/client React hook.
import { useMutation } from "@apollo/client";
// Import the ADD_USER mutation.
import { ADD_USER } from "../utils/mutations";
// Import the Auth service.
import Auth from "../utils/auth";
// Define the SignUpForm functional component.
const SignupForm = () => {
  // Set initial form state.
  const [userFormData, setUserFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  // Define the addUser mutation.
  const [addUser, { error }] = useMutation(ADD_USER);
  // Set state for form validation.
  const [validated] = useState(false);
  // Set state for alert.
  const [showAlert, setShowAlert] = useState(false);
  // Define the handleInputChange function with the event parameter.
  const handleInputChange = (event) => {
    // Destructure the name and value properties from the event.target object.
    const { name, value } = event.target;
    // Update the userFormData state using the setUserFormData function.
    setUserFormData({ ...userFormData, [name]: value });
  };
  // Define the handleFormSubmit function with the event parameter, and prevent the default form submission behavior.
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // Check if form has everything (as per react-bootstrap docs).
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    // Try block to execute the addUser mutation and pass the userFormData as the variables.
    try {
      const { data } = await addUser({
        variables: { ...userFormData },
      });
      // Use the Auth.login() method to log the user in with the token received from the mutation response.
      const token = data.addUser.token;
      Auth.login(token);
    } catch (err) {
      if (err.graphQLErrors) {
        console.error("GraphQL errors:", err.graphQLErrors);
        // Check for specific error message related to duplicate key.
        const duplicateError = err.graphQLErrors.find((error) =>
          error.message.includes("duplicate key error")
        );
        if (duplicateError) {
          alert("Username already exists. Please choose a different username.");
        } else {
          alert("An error occurred during signup.");
        }
      }
      // Check for network error.
      if (err.networkError) {
        console.error("Network error:", err.networkError);
      }
      console.error("Error details:", error);
      setShowAlert(true);
    }
    // Clear form values after submission.
    setUserFormData({
      username: "",
      email: "",
      password: "",
    });
  };

  return (
    <>
      {/* This is needed for the validation functionality above */}
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        {/* show alert if server response is bad */}
        <Alert
          dismissible
          onClose={() => setShowAlert(false)}
          show={showAlert}
          variant="danger"
        >
          Something went wrong with your signup!
        </Alert>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="username">Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Your username"
            name="username"
            onChange={handleInputChange}
            value={userFormData.username}
            required
          />
          <Form.Control.Feedback type="invalid">
            Username is required!
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="email">Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Your email address"
            name="email"
            onChange={handleInputChange}
            value={userFormData.email}
            required
          />
          <Form.Control.Feedback type="invalid">
            Email is required!
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="password">Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Your password"
            name="password"
            onChange={handleInputChange}
            value={userFormData.password}
            required
          />
          <Form.Control.Feedback type="invalid">
            Password is required!
          </Form.Control.Feedback>
        </Form.Group>
        <Button
          disabled={
            !(
              userFormData.username &&
              userFormData.email &&
              userFormData.password
            )
          }
          type="submit"
          variant="success"
        >
          Submit
        </Button>
      </Form>
    </>
  );
};

export default SignupForm;
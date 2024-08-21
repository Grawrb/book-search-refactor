// Replace the loginUser() functionality imported from the API file with the LOGIN_USER mutation functionality.
// Import useState from react.
import { useState } from "react";
// Import Form, Button, and Alert components from react-bootstrap.
import { Form, Button, Alert } from "react-bootstrap";
// Import the useMutation hook from the @apollo/client React hook.
import { useMutation } from "@apollo/client";
// Import the LOGIN_USER mutation.
import { LOGIN_USER } from "../utils/mutations";
// Import the Auth service.
import Auth from "../utils/auth";
// Define the LoginForm functional component.
const LoginForm = () => {
  // Define the userFormData and setUserFormData states using the useState hook.
  const [userFormData, setUserFormData] = useState({ email: "", password: "" });
  // Define the validated state using the useState hook.
  const [validated] = useState(false);
  // Define the showAlert and setShowAlert states using the useState hook.
  const [showAlert, setShowAlert] = useState(false);
  // Define the loginUser mutation.
  const [loginUser] = useMutation(LOGIN_USER);
  // Define the handleInputChange function with the event parameter.
  const handleInputChange = (event) => {
    // Destructure the name and value properties from the event.target object.
    const { name, value } = event.target;
    // Update the userFormData state using the setUserFormData function.
    setUserFormData({ ...userFormData, [name]: value });
  };
  // Define the handleFormSubmit function with the event parameter.
  const handleFormSubmit = async (event) => {
    // Prevent the default form submission behavior.
    event.preventDefault();

    // Check if form has everything (as per react-bootstrap docs).
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    // Set the validated state to true.
    try {
      // Execute the loginUser mutation and pass the userFormData as the variables.
      const { data } = await loginUser({
        variables: { ...userFormData },
      });
      // Console.log(data)
      // Use the Auth.login() method to log the user in with the token received from the mutation response.
      const token = data.login.token;
      Auth.login(token);
    } catch (err) {
      console.error(err);
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
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        <Alert
          dismissible
          onClose={() => setShowAlert(false)}
          show={showAlert}
          variant="danger"
        >
          Something went wrong with your login credentials!
        </Alert>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="email">Email</Form.Label>
          <Form.Control
            type="text"
            placeholder="Your email"
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
          disabled={!(userFormData.email && userFormData.password)}
          type="submit"
          variant="success"
        >
          Submit
        </Button>
      </Form>
    </>
  );
};

export default LoginForm;
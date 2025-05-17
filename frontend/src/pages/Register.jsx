import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";

function Register() {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/register",
        values,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("User registered", response.data);
      setSuccess(true);
      setError("");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error(
        "Error during registration",
        error.response?.data?.message || error.message
      );
      setError("Registration failed. Please try again.");
      setSuccess(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Row className="w-100">
        <Col xs={12} md={6} className="mx-auto">
          <h2 className="text-center mb-4">Register</h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Registration successful! Redirecting...</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Enter username"
                value={values.username}
                onChange={handleChanges}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                value={values.email}
                onChange={handleChanges}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter password"
                value={values.password}
                onChange={handleChanges}
                required
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </div>

            <div className="mt-3 text-center">
              <span>Already have an account? </span>
              <Button variant="link" onClick={() => navigate("/login")}>
                Login
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;

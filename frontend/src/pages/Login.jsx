import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import { Form, Button, Container, Row, Col, Alert } from "react-bootstrap";
import config from "../config";

function Login() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${config.apiUrl}/api/users/login`,
        values,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token);

      console.log("User logged in", user);
      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Error during login",
        error.response?.data?.message || error.message
      );
      setError("Invalid email or password");
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <Row className="w-100">
        <Col xs={12} md={6} className="mx-auto">
          <h2 className="text-center mb-4">Login</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={values.email}
                onChange={handleChanges}
                placeholder="Enter your email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={values.password}
                onChange={handleChanges}
                placeholder="Enter your password"
                required
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </div>

            <div className="mt-3 text-center">
              <span>New user? </span>
              <Button variant="link" onClick={() => navigate("/register")}>
                Please register
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;

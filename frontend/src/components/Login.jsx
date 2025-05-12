import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";

function Login() {

    const navigate = useNavigate();


  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        values,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const {token, user} = response.data

      localStorage.setItem("token", token);

      console.log("User logged in", user);

      navigate("/transactions")



    } catch (error) {
      console.error(
        "Error during login",
        error.response?.data?.message || error.message
      );
    }
  };

  return (
    <div className="container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          type="text"
          placeholder="Enter email"
          name="email"
          onChange={(e) => handleChanges(e)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          type="text"
          placeholder="Enter password"
          name="password"
          onChange={(e) => handleChanges(e)}
          required
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}


export default Login
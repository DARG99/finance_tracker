import React, { useState } from "react";
import axios from "axios";


function Register() {
  const [values, setValues] = useState({
    username: "",
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
        "http://localhost:5000/api/users/register",
        values,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("User registered", response.data);
    } catch (error) {
      console.error(
        "Error during registration",
        error.response?.data?.message || error.message
      );
    }
  };

  return (
    <div className="container-md py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="card-title text-center mb-4">Register</h1>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    placeholder="Enter username"
                    onChange={handleChanges}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="Enter email"
                    onChange={handleChanges}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    placeholder="Enter password"
                    onChange={handleChanges}
                    required
                  />
                </div>

                <div className="d-grid">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

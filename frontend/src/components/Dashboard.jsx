import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to your Dashboard!</h1>
      <p>You are successfully logged in.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;

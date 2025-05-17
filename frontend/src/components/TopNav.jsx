import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import HamburgerMenu from "./Hamburguer";
import { useNavigate } from "react-router-dom";

function TopNav() {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <>
      <div className="d-flex align-items-center justify-content-between p-2 border-bottom">
        <div className="d-flex align-items-center">
          <Button
            variant="light"
            onClick={() => setShow(true)}
            className="me-2"
          >
            <i className="bi bi-list" style={{ fontSize: "1.5rem" }}></i>
          </Button>
          <h5 className="mb-0">Finance Tracker</h5>
        </div>

        <Button
          variant="outline-danger"
          onClick={handleLogout}
          className="ms-auto"
        >
          Logout
        </Button>
      </div>
      <HamburgerMenu
      show={show}
      handleClose={() => setShow(false)}
      user={user}
    />
    </>
  );
}

export default TopNav;

import React from "react";
import { Offcanvas } from "react-bootstrap";

function HamburgerMenu({ show, handleClose, user }) {
  return (
    <Offcanvas show={show} onHide={handleClose}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Hello, {user?.username || "User"}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="d-flex justify-content-center">
        <a href="/profile" className="text-decoration-none">
          Go to Profile
        </a>
        {/* Add more items here in the future */}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default HamburgerMenu;

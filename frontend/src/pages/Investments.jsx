import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InvestmentCard from "../components/InvestmentCard";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import config from "../config";

export default function Investments() {
  const [investments, setInvestments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const goToInvestmentDetails = (investmentId) => {
    navigate(`/investments/${investmentId}/details`);
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const token = localStorage.getItem("token"); // get token
      const res = await axios.get(
        `${config.apiUrl}/api/investments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInvestments(res.data);
    } catch (err) {
      console.error("Error fetching investments", err);
    }
  };

  const handleAddInvestment = async () => {
    setError("");
    if (!name || !ticker) {
      setError("Please fill out both fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Check if ticker exists - no auth needed here? Add token if required
      const check = await axios.get(
        `${config.apiUrl}/api/investments/price/${ticker}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!check.data.currentPrice) {
        setError("Invalid ticker.");
        return;
      }

      await axios.post(
        `${config.apiUrl}/api/investments`,
        { name, ticker },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchInvestments();
      setShowModal(false);
      setName("");
      setTicker("");
    } catch (err) {
      console.error("Failed to add investment", err);
      setError("Error adding investment.");
    }
  };

  return (
    <div className="container mt-4">
      <h2>My Investments</h2>

      {investments.map((inv) => (
        <InvestmentCard
          key={inv.id}
          name={inv.name}
          ticker={inv.ticker}
          onClick={() => goToInvestmentDetails(inv.id)}
        />
      ))}

      <Button variant="primary" onClick={() => setShowModal(true)}>
        + Add Investment
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Investment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="text-danger mb-2">{error}</div>}
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Bitcoin"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Ticker</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. BTC-USD"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddInvestment}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

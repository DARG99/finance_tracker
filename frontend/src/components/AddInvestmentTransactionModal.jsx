// components/AddInvestmentTransactionModal.js
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import config from "../config";

function AddInvestmentTransactionModal({ show, onHide, investmentId, onSave }) {
  const [date, setDate] = useState("");
  const [amountInvested, setAmountInvested] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [tax, setTax] = useState("0");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!date || !amountInvested || !pricePerUnit) {
      alert("Please fill in all fields.");
      return;
    }

    const token = localStorage.getItem("token");
    const payload = {
      date,
      amount_invested: parseFloat(amountInvested),
      price_per_unit: parseFloat(pricePerUnit),
      tax: parseFloat(tax) || 0,
    };

    try {
      setSaving(true);
      await axios.post(
        `${config.apiUrl}/api/investments/${investmentId}/transactions`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onSave(); // refresh parent
      setDate("");
      setAmountInvested("");
      setPricePerUnit("");
      setTax("0");
    } catch (err) {
      console.error("Failed to add investment transaction", err);
      alert("Failed to add transaction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Investment Transaction</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Amount Invested (€)</Form.Label>
            <Form.Control
              type="number"
              value={amountInvested}
              onChange={(e) => setAmountInvested(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Price Per Unit (€)</Form.Label>
            <Form.Control
              type="number"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tax (€)</Form.Label>
            <Form.Control
              type="number"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              placeholder="0"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Add Transaction"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AddInvestmentTransactionModal;

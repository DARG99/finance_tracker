import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import config from "../config";

function EditInvestmentTransactionModal({
  show,
  onHide,
  transaction,
  investmentId,
  onSave,
}) {
  const [date, setDate] = useState("");
  const [amountInvested, setAmountInvested] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [tax, setTax] = useState("0");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (transaction) {
      setDate(transaction.date?.slice(0, 10) || "");
      setAmountInvested(transaction.amount_invested);
      setPricePerUnit(transaction.price_per_unit);
      setTax(transaction.tax || "0");
    }
  }, [transaction]);

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
      await axios.put(
        `${config.apiUrl}/api/investments/${investmentId}/transactions/${transaction.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onSave(); // trigger parent to refresh data
      onHide();  // close modal
    } catch (err) {
      console.error("Failed to update investment transaction", err);
      alert("Failed to update transaction.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Investment Transaction</Modal.Title>
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
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditInvestmentTransactionModal;

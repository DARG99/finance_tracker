import React, { useState, useEffect } from "react";
import { Modal, Button, Alert, Form } from "react-bootstrap";
import axios from "axios";
import config from "../config";

function EditTransactionModal({ show, onHide, transaction, onSave }) {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    transaction_date: "",
    type: "expense",
  });

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  // Fix for the date timezone issue
  const fixDateOffset = (dateString) => {
    if (!dateString) return "";

    // Parse the date and make sure it doesn't shift days
    const parts = dateString.split("T")[0].split("-");
    if (parts.length !== 3) return dateString;

    // Add one day to compensate for timezone offset
    const date = new Date(parts[0], parts[1] - 1, parseInt(parts[2]) + 1);

    // Format back to YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${config.apiUrl}/api/categories`);
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (transaction) {
      // Apply the date fix when setting the form data
      const fixedDate = fixDateOffset(transaction.transaction_date);
      console.log("Original date:", transaction.transaction_date);
      console.log("Fixed date:", fixedDate);

      setFormData({
        amount: transaction.amount || "",
        description: transaction.description || "",
        category: transaction.category_id?.toString() || "",
        transaction_date: fixedDate,
        type: transaction.type || "expense",
      });
      setError("");
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "type" ? { category: "" } : {}), // reset category if type changes
    }));
  };

  const handleSave = async () => {
    const { amount, description, category, transaction_date, type } = formData;

    if (!amount || !description || !category || !transaction_date || !type) {
      return setError("All fields are required.");
    }

    try {
      const token = localStorage.getItem("token");

      console.log("Sending transaction data:", {
        amount,
        description,
        categoryid: parseInt(category),
        transaction_date,
        type,
      });

      const res = await axios.put(
        `${config.apiUrl}/api/transactions/${transaction.id}`,
        {
          amount,
          description,
          categoryid: parseInt(category),
          transaction_date,
          type,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onSave(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to update transaction.");
    }
  };

  const filteredCategories = categories.filter(
    (cat) => cat.type === formData.type
  );

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Transaction</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form.Group className="mb-3">
          <Form.Label>Amount</Form.Label>
          <Form.Control
            type="number"
            inputMode="decimal"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Type</Form.Label>
          <div>
            <Form.Check
              inline
              label="Expense"
              type="radio"
              name="type"
              value="expense"
              checked={formData.type === "expense"}
              onChange={handleChange}
            />
            <Form.Check
              inline
              label="Income"
              type="radio"
              name="type"
              value="income"
              checked={formData.type === "income"}
              onChange={handleChange}
            />
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">-- Select Category --</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            name="transaction_date"
            value={formData.transaction_date}
            onChange={handleChange}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditTransactionModal;

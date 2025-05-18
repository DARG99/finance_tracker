import React, { useState, useEffect } from "react";

function AddTransaction() {
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    amount: "",
    type: "expense",
    date: today,
    category: "",
    description: "",
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://192.168.1.85:5000/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      // If type is changed, reset the category
      if (name === "type") {
        return {
          ...prev,
          [name]: value,
          category: "", // Reset category when type changes
        };
      }

      // For other fields, just update normally
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token"); // Assumes you store it like this

    if (!token) {
      alert("User not authenticated.");
      return;
    }

    const transactionData = {
      amount: parseFloat(formData.amount),
      type: formData.type,
      description: formData.description, // Add a description input if needed
      transaction_date: formData.date,
      categoryid: parseInt(formData.category), // Assuming it's an integer
    };

    try {
      const res = await fetch("http://localhost:5000/api/transactions/addtransaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify(transactionData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to add transaction");
      }

      alert("Transaction added successfully!");
      setFormData({
        amount: "",
        type: "expense",
        date: new Date().toISOString().split("T")[0],
        category: "",
      });
    } catch (err) {
      console.error(err);
      alert("Error submitting transaction");
    }
  };

  // Filter categories based on the current transaction type
  const filteredCategories = categories.filter(
    (cat) => cat.type === formData.type
  );

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-center">Add Transaction</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="amount" className="form-label">
            Amount
          </label>
          <div className="input-group">
            <span className="input-group-text">€</span>
            <input
              type="number"
              inputMode="decimal"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label d-block">Type</label>
          <div className="form-check form-check-inline">
            <input
              type="radio"
              name="type"
              value="expense"
              checked={formData.type === "expense"}
              onChange={handleChange}
              className="form-check-input"
              id="typeExpense"
            />
            <label className="form-check-label" htmlFor="typeExpense">
              Expense
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              type="radio"
              name="type"
              value="income"
              checked={formData.type === "income"}
              onChange={handleChange}
              className="form-check-input"
              id="typeIncome"
            />
            <label className="form-check-label" htmlFor="typeIncome">
              Income
            </label>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="date" className="form-label">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="category" className="form-label">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">-- Select Category --</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <input
            type="text"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            className="form-control"
            placeholder="Optional description"
          />
        </div>

        <div className="d-grid gap-2 mt-4 mb-5">
          <button type="submit" className="btn btn-primary btn-lg">
            Add Transaction
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddTransaction;

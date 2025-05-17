import React, { useState, useEffect } from "react";
import axios from "axios";
import { Spinner} from "react-bootstrap";
import { CurrencyDollar, Pencil, Trash, Funnel } from "react-bootstrap-icons";
import EditTransactionModal from "../components/EditTransaction";

function Transaction() {
  const [transactions, setTransactions] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [pageNumber]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    try {
      const res = await axios.get("http://192.168.1.85:5000/api/transactions", {
        params: { page: pageNumber },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTransactions((prev) => {
        const newTransactions = res.data.filter(
          (txn) => !prev.some((p) => p.id === txn.id)
        );
        return [...prev, ...newTransactions];
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTransactions((prev) => prev.filter((txn) => txn.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete transaction.");
    }
  };

  const handleEditClick = (txn) => {
    setEditingTransaction(txn);
    setShowModal(true);
  };

  const formatDate = (isoDate) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(isoDate).toLocaleDateString(undefined, options);
  };

  const uniqueCategories = [
    "All",
    ...new Set(transactions.map((txn) => txn.category)),
  ];

  const filteredTransactions = transactions.filter((txn) => {
    const matchCategory =
      selectedCategory === "All" || txn.category === selectedCategory;
    const matchSearch = txn.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Transaction History</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filter Toggle Button */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <button
          className="btn btn-outline-secondary"
          onClick={() => setShowFilters(!showFilters)}
          aria-controls="filters-collapse"
          aria-expanded={showFilters}
        >
          <Funnel className="me-2" /> Filters
        </button>
      </div>

      {/* Collapsible Filter Section */}
      <div
        id="filters-collapse"
        className={`mb-4 collapse ${showFilters ? "show" : ""}`}
      >
        <div className="row">
          <div className="col-md-6 mb-2">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search by description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="list-group">
        {filteredTransactions.map((txn) => (
          <div
            key={txn.id}
            className="list-group-item d-flex align-items-start justify-content-between"
          >
            <div className="d-flex align-items-start">
              <div className="me-3 mt-1">
                <CurrencyDollar className="fs-4" />
              </div>
              <div>
                <div className="fw-bold">{txn.category}</div>
                <div className="text-muted">{txn.description}</div>
                <div className="text-muted">
                  {formatDate(txn.transaction_date)}
                </div>
              </div>
            </div>

            <div className="d-flex flex-column align-items-end">
              <div
                className={`fw-bold mb-2 ${
                  txn.type === "income" ? "text-success" : "text-danger"
                }`}
              >
                {txn.amount}€
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => handleEditClick(txn)}
                >
                  <Pencil />
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleDelete(txn.id)}
                >
                  <Trash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center my-3">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      <EditTransactionModal
        show={showModal}
        onHide={() => setShowModal(false)}
        transaction={editingTransaction}
        onSave={() => {
          setShowModal(false);
          setTransactions([]);
          fetchTransactions();
        }}
      />
    </div>
  );
}

export default Transaction;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { CurrencyDollar, Pencil, Trash, Funnel } from "react-bootstrap-icons";
import EditTransactionModal from "../components/EditTransaction";
import ConfirmModal from "../components/ConfirmModal";

function Transaction() {
  const [transactions, setTransactions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const limit = 10;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [firstLoad, setFirstLoad] = useState(true); // Track initial page load

  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://192.168.1.85:5000/api/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const allCategories = res.data.map((cat) => cat.name); // Adjust based on your actual data shape
      setCategories(["All", ...allCategories]);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // debounce delay
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearch, selectedCategory]);

  useEffect(() => {
    fetchTransactions();
  }, [pageNumber, debouncedSearch, selectedCategory]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    try {
      const res = await axios.get("http://192.168.1.85:5000/api/transactions", {
        params: {
          page: pageNumber,
          limit,
          search: debouncedSearch,
          category: selectedCategory === "All" ? "" : selectedCategory,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      

      setTransactions(res.data.transactions);
      const total = res.data.total;
      setTotalPages(Math.ceil(total / limit));
      setFirstLoad(false); // Mark that the first data load is complete
    } catch (err) {
      console.error(err);
      setError("Failed to load transactions.");
      setFirstLoad(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      console.log("here");
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

  // Determine which empty state message to show
  const getEmptyStateMessage = () => {
    if (debouncedSearch) {
      return "No transactions found for this search.";
    } else if (selectedCategory !== "All") {
      return `No transactions found in the "${selectedCategory}" category.`;
    } else {
      return "You haven't added any transactions yet.";
    }
  };

  // Filter transactions based on selected category and search term
  const filteredTransactions = transactions.filter((txn) => {
    const matchCategory =
      selectedCategory === "All" || txn.category === selectedCategory;
    const matchSearch = txn.description
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="container mt-4 pb-5">
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
              {categories.map((cat) => (
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
      {!loading && filteredTransactions.length > 0 ? (
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
                  <div className="text-muted">
                    {txn.description}
                    {txn.funding_source && (
                      <span className="ms-2 d-block d-sm-inline text-secondary">
                        - Funding Source: {txn.funding_source}
                      </span>
                    )}
                  </div>
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
                    onClick={() => {
                      setDeleteId(txn.id);
                      setShowConfirmModal(true);
                    }}
                  >
                    <Trash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading &&
        !firstLoad && (
          <div className="text-center py-5">
            <h5 className="text-muted">{getEmptyStateMessage()}</h5>
            {selectedCategory === "All" && !debouncedSearch && (
              <p className="mt-3">
                Add your first transaction to start tracking your finances.
              </p>
            )}
          </div>
        )
      )}

      {/* Pagination - hidden if no results */}
      {filteredTransactions.length > 0 && totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-4 gap-3">
          <button
            className="btn btn-outline-primary"
            onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
            disabled={pageNumber === 1}
          >
            Previous
          </button>
          <span>
            Page {pageNumber} of {totalPages}
          </span>
          <button
            className="btn btn-outline-primary"
            onClick={() =>
              setPageNumber((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={pageNumber === totalPages}
          >
            Next
          </button>
        </div>
      )}

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
      <ConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={async () => {
          if (deleteId !== null) {
            await handleDelete(deleteId);
          }
          setShowConfirmModal(false);
          setDeleteId(null);
        }}
        message="Are you sure you want to delete this transaction?"
      />
    </div>
  );
}

export default Transaction;

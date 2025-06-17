import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash } from "react-bootstrap-icons";
import { Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import EditInvestmentTransactionModal from "../components/EditInvestmentTransactionModal";
import AddInvestmentTransactionModal from "../components/AddInvestmentTransactionModal";
import ConfirmModal from "../components/ConfirmModal";
import config from "../config";

function InvestmentDetailsPage() {
  const { investmentId } = useParams();

  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStart, setAppliedStart] = useState("");
  const [appliedEnd, setAppliedEnd] = useState("");

  const [debouncedStart, setDebouncedStart] = useState("");
  const [debouncedEnd, setDebouncedEnd] = useState("");

  const limit = 10;

  // Debounce date inputs (500ms)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedStart(startDate);
      setDebouncedEnd(endDate);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [startDate, endDate]);

  const fetchTransactions = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `${config.apiUrl}/api/investments/${investmentId}/details`,
        {
          params: {
            page,
            limit,
            start: appliedStart,
            end: appliedEnd,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTransactions(res.data.transactions);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error("Failed to fetch investment transactions", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when page, investmentId, or applied filters change
  useEffect(() => {
    if (investmentId) {
      fetchTransactions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, investmentId, appliedStart, appliedEnd]);

  const applyFilter = () => {
    setPage(1);
    setAppliedStart(startDate);
    setAppliedEnd(endDate);
  };

  const resetFilter = () => {
    setStartDate("");
    setEndDate("");
    setAppliedStart("");
    setAppliedEnd("");
    setPage(1);
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `${config.apiUrl}/api/investments/${investmentId}/transactions/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchTransactions();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete transaction.");
    }
  };

  const formatDate = (isoDate) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(isoDate).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mt-4 pb-5">
      <h2 className="mb-3">Investment Details</h2>

      <div className="mb-4 row">
        <div className="col-md-6 mb-2">
          <label>Start Date</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => {
              setPage(1);
              setStartDate(e.target.value);
            }}
          />
        </div>
        <div className="col-md-6 mb-2">
          <label>End Date</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => {
              setPage(1);
              setEndDate(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="mb-3 d-flex gap-2">
        <button className="btn btn-primary" onClick={applyFilter}>
          Apply Filter
        </button>
        <button className="btn btn-secondary" onClick={resetFilter}>
          Reset
        </button>
      </div>

      {loading ? (
        <div className="text-center my-3">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-5">
          <h5 className="text-muted">No investment transactions found.</h5>
        </div>
      ) : (
        <div className="row">
          {transactions.map((txn) => (
            <div key={txn.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm rounded-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <small className="text-muted">{formatDate(txn.date)}</small>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        setEditingTransaction(txn);
                        setShowEditModal(true);
                      }}
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
                <div className="card-body">
                  <p className="mb-1">
                    <strong>Amount Invested:</strong> {txn.amount_invested} €
                  </p>
                  <p className="mb-1">
                    <strong>Price per Unit:</strong> {txn.price_per_unit} €
                  </p>
                  <p className="mb-1">
                    <strong>Units Bought:</strong> {txn.units_bought.toFixed(8)}
                  </p>
                  <p className="mb-1">
                    <strong>Current Price:</strong> {txn.current_price} €
                  </p>
                  <p className="mb-1">
                    <strong>Current Value:</strong>{" "}
                    {txn.current_value.toFixed(2)} €
                  </p>
                  <p className="mb-1">
                    <strong>Tax:</strong> {txn.tax} €
                  </p>
                  <p className="mb-0">
                    <strong>Gain/Loss:</strong> {txn.gain_loss >= 0 ? "+" : ""}
                    {txn.gain_loss.toFixed(2)} € (
                    <span
                      className={
                        txn.gain_loss >= 0 ? "text-success" : "text-danger"
                      }
                    >
                      {txn.gain_loss_percent.toFixed(2)}%
                    </span>
                    )
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {transactions.length > 0 && totalPages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPage(page - 1)}>
                Previous
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li
                key={i + 1}
                className={`page-item ${page === i + 1 ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => setPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${page === totalPages ? "disabled" : ""}`}
            >
              <button className="page-link" onClick={() => setPage(page + 1)}>
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}

      <EditInvestmentTransactionModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        transaction={editingTransaction}
        investmentId={investmentId}
        onSave={fetchTransactions}
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

      <AddInvestmentTransactionModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        investmentId={investmentId}
        onSave={() => {
          setShowAddModal(false);
          fetchTransactions();
        }}
      />

      {/* Floating Add Button */}
      <button
        className="btn btn-primary rounded-circle"
        style={{
          position: "fixed",
          bottom: "80px",
          left: "20px",
          width: "50px",
          height: "50px",
          zIndex: 999,
          fontSize: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={() => setShowAddModal(true)}
      >
        +
      </button>
    </div>
  );
}

export default InvestmentDetailsPage;

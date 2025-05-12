import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";


function Transaction() {
  const [transactions, setTransactions] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const observer = useRef();
  const lastBookElementRef = useCallback(
    (node) => {
      if (loading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        console.log("entries", entries)
        if (entries[0].isIntersecting) {
          console.log("visible");
          setPageNumber((prev) => prev + 1); // optional: load next page
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading]
  );

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      try {
        const res = await axios.get(
          "http://localhost:5000/api/transactions/transactions",
          {
            params: { page: pageNumber },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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

    fetchTransactions();
  }, [pageNumber]);

  return (
    <div>
      <h1>Transaction History</h1>
      <ul className="transaction-list">
        {transactions.map((txn, index) => {
          if (index === transactions.length - 1) {
            return (
              <li
                key={txn.id}
                ref={lastBookElementRef}
                className="transaction-item"
              >
                <div className="transaction-info">
                  <span>{txn.id}</span>
                  <span>{txn.description}</span>
                  <span>{txn.amount}€</span>
                  <span>{txn.transaction_date}</span>
                </div>
              </li>
            );
          } else {
            return (
              <li key={txn.id} className="transaction-item">
                <div className="transaction-info">
                  <span>{txn.id}</span>
                  <span>{txn.description}</span>
                  <span>{txn.amount}€</span>
                  <span>{txn.transaction_date}</span>
                </div>
              </li>
            );
          }
        })}
      </ul>

      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default Transaction;

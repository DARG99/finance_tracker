import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Accordion, Card } from "react-bootstrap";
import config from "../config";

function DashboardPage() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [transferCategories, setTransferCategories] = useState([]);
  const [monthlyTotals, setMonthlyTotals] = useState([]);
  const [yearlyTotals, setYearlyTotals] = useState({ total_income: 0, total_expenses: 0 });
  const [viewMode, setViewMode] = useState("monthly"); // "monthly" or "yearly"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const token = localStorage.getItem("token");

  const fetchMonthlyDashboard = useCallback(async (year) => {
    try {
      const res = await axios.get(
        `${config.apiUrl}/api/dashboard/monthly?year=${year}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMonthlyData(res.data.monthly || []);
      setMonthlyTotals(res.data.monthlyTotals || []);
      setYearlyTotals(res.data.yearlyTotal || { total_income: 0, total_expenses: 0 });
    } catch (err) {
      console.error("Monthly dashboard fetch error:", err);
      setMonthlyData([]);
      setError("Failed to load monthly dashboard.");
    }
  }, [token]);

  const fetchYearlyDashboard = useCallback(async () => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/dashboard/yearly`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setYearlyData(res.data.yearly || []);
      setYearlyTotals(res.data.total || { total_income: 0, total_expenses: 0 });
    } catch (err) {
      console.error("Yearly dashboard fetch error:", err);
      setYearlyData([]);
      setError("Failed to load yearly dashboard.");
    }
  }, [token]);

  const fetchTransferCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/dashboard/transfer-categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransferCategories(res.data || []);
    } catch (err) {
      console.error("Transfer categories fetch error:", err);
      setTransferCategories([]);
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetchMonthlyDashboard(selectedYear),
      fetchYearlyDashboard(),
      fetchTransferCategories(),
    ]).finally(() => setLoading(false));
  }, [selectedYear, fetchMonthlyDashboard, fetchYearlyDashboard, fetchTransferCategories]);

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  if (loading) {
    return <div className="text-center mt-5">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-3">{error}</div>;
  }

  return (
    <div className="container mt-4 pb-5">
      <h2>Dashboard</h2>

      {/* Total Summary */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Total Income (All Time)</h5>
              <p className="card-text h3">{yearlyTotals.total_income.toFixed(2)} €</p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h5 className="card-title">Total Expenses (All Time)</h5>
              <p className="card-text h3">{yearlyTotals.total_expenses.toFixed(2)} €</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="mb-4">
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn ${viewMode === "monthly" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => handleViewModeChange("monthly")}
          >
            Monthly View
          </button>
          <button
            type="button"
            className={`btn ${viewMode === "yearly" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => handleViewModeChange("yearly")}
          >
            Yearly View
          </button>
        </div>
      </div>

      {/* Income & Expenses Chart */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="card-title mb-4">
            {viewMode === "monthly" ? "Monthly" : "Yearly"} Income & Expenses
          </h4>
          
          {viewMode === "monthly" && (
            <div className="mb-3">
              <label htmlFor="yearSelect" className="form-label">
                Select Year:
              </label>
              <select
                id="yearSelect"
                className="form-select w-auto"
                value={selectedYear}
                onChange={handleYearChange}
              >
                {[...Array(10)].map((_, i) => {
                  const year = currentYear - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={viewMode === "monthly" ? monthlyData : yearlyData}
              margin={{ top: 20, right: 30, bottom: 20, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={viewMode === "monthly" ? "month" : "year"} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#4caf50" name="Income" />
              <Bar dataKey="expenses" fill="#f44336" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Collapsible Sections */}
      <Accordion>
        {/* Monthly Totals */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>Monthly Totals</Accordion.Header>
          <Accordion.Body>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Income</th>
                    <th>Expenses</th>
                    <th>Net</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyTotals.map((month, index) => (
                    <tr key={index}>
                      <td>{month.month}</td>
                      <td className="text-success">{month.total_income.toFixed(2)} €</td>
                      <td className="text-danger">{month.total_expenses.toFixed(2)} €</td>
                      <td className={month.total_income - month.total_expenses >= 0 ? "text-success" : "text-danger"}>
                        {(month.total_income - month.total_expenses).toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="fw-bold">
                    <td>Total</td>
                    <td className="text-success">{yearlyTotals.total_income.toFixed(2)} €</td>
                    <td className="text-danger">{yearlyTotals.total_expenses.toFixed(2)} €</td>
                    <td className={yearlyTotals.total_income - yearlyTotals.total_expenses >= 0 ? "text-success" : "text-danger"}>
                      {(yearlyTotals.total_income - yearlyTotals.total_expenses).toFixed(2)} €
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Accordion.Body>
        </Accordion.Item>

        {/* Yearly Totals */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>Yearly Totals</Accordion.Header>
          <Accordion.Body>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Income</th>
                    <th>Expenses</th>
                    <th>Net</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyData.map((year, index) => (
                    <tr key={index}>
                      <td>{year.year}</td>
                      <td className="text-success">{year.income.toFixed(2)} €</td>
                      <td className="text-danger">{year.expenses.toFixed(2)} €</td>
                      <td className={year.income - year.expenses >= 0 ? "text-success" : "text-danger"}>
                        {(year.income - year.expenses).toFixed(2)} €
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="fw-bold">
                    <td>Total</td>
                    <td className="text-success">{yearlyTotals.total_income.toFixed(2)} €</td>
                    <td className="text-danger">{yearlyTotals.total_expenses.toFixed(2)} €</td>
                    <td className={yearlyTotals.total_income - yearlyTotals.total_expenses >= 0 ? "text-success" : "text-danger"}>
                      {(yearlyTotals.total_income - yearlyTotals.total_expenses).toFixed(2)} €
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Accordion.Body>
        </Accordion.Item>

        {/* Transfer Categories */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>Transfer Categories</Accordion.Header>
          <Accordion.Body>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transferCategories.map((category, index) => (
                    <tr key={index}>
                      <td>{category.category}</td>
                      <td>{category.total_amount.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="fw-bold">
                    <td>Total</td>
                    <td>
                      {transferCategories
                        .reduce((sum, category) => sum + category.total_amount, 0)
                        .toFixed(2)} €
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export default DashboardPage;

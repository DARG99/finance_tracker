import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import config from "../config";

function DashboardPage() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [investmentsData, setInvestmentsData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const token = localStorage.getItem("token");

  const fetchMonthlyDashboard = async (year) => {
    try {
      const res = await axios.get(
        `${config.apiUrl}/dashboard/monthly?year=${year}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Monthly data response:", res.data);
      setMonthlyData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Monthly dashboard fetch error:", err);
      setMonthlyData([]);
      setError("Failed to load monthly dashboard.");
    }
  };

  const fetchYearlyDashboard = async () => {
    try {
      const res = await axios.get(`${config.apiUrl}/dashboard/yearly`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Yearly data response:", res.data);
      setYearlyData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Yearly dashboard fetch error:", err);
      setYearlyData([]);
      setError("Failed to load yearly dashboard.");
    }
  };

  // If you later enable this, apply the same Array.isArray check
  /*
  const fetchInvestmentsSummary = async () => {
    try {
      const res = await axios.get(`${config.apiUrl}/dashboard/investments-summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data)
        ? res.data.map((inv) => {
            const gainLossPercent = inv.currentprice
              ? ((inv.currentprice * (inv.amountinvested / inv.currentprice) -
                  inv.amountinvested) /
                  inv.amountinvested) *
                100
              : 0;

            return {
              ticker: inv.ticker,
              amountInvested: inv.amountinvested,
              gainLoss: inv.gainLoss,
              gainLossPercent,
            };
          })
        : [];

      setInvestmentsData(data);
    } catch (err) {
      console.error("Investments summary fetch error:", err);
      setInvestmentsData([]);
      setError("Failed to load investments summary.");
    }
  };
  */

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetchMonthlyDashboard(selectedYear),
      fetchYearlyDashboard(),
      // fetchInvestmentsSummary()
    ]).finally(() => setLoading(false));
  }, [selectedYear]);

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const safeMonthlyData = Array.isArray(monthlyData) ? monthlyData : [];
  const safeYearlyData = Array.isArray(yearlyData) ? yearlyData : [];
  const safeInvestmentsData = Array.isArray(investmentsData) ? investmentsData : [];

  if (loading) {
    return <div className="text-center mt-5">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-3">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Dashboard</h2>

      {/* Year selector */}
      <div className="mb-4">
        <label htmlFor="yearSelect" className="form-label">
          Select Year for Monthly View:
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

      {/* Monthly Chart */}
      <h4>Monthly Income & Expenses ({selectedYear})</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={safeMonthlyData} margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" fill="#4caf50" name="Income" />
          <Bar dataKey="expenses" fill="#f44336" name="Expenses" />
        </BarChart>
      </ResponsiveContainer>

      {/* Yearly Chart */}
      <h4 className="mt-5">Yearly Income & Expenses</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={safeYearlyData} margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#4caf50" name="Income" />
          <Line type="monotone" dataKey="expenses" stroke="#f44336" name="Expenses" />
        </LineChart>
      </ResponsiveContainer>

      {/* Investments Chart - optional */}
      <h4 className="mt-5">Investments Summary (Total Invested & Gain/Loss)</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={safeInvestmentsData}
          margin={{ top: 20, right: 30, bottom: 20, left: 0 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="ticker" type="category" tick={{ fontSize: 14 }} width={80} />
          <Tooltip formatter={(value) => value?.toFixed?.(2) ?? value} />
          <Legend />
          <Bar dataKey="amountInvested" fill="#2196f3" name="Total Invested (€)" />
          <Bar dataKey="gainLoss" fill="#ff9800" name="Gain/Loss (€)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DashboardPage;

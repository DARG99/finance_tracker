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

  // Fetch monthly dashboard for selectedYear
  const fetchMonthlyDashboard = async (year) => {
    try {
      const res = await axios.get(
        `${config.apiUrl}/dashboard/monthly?year=${year}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMonthlyData(res.data);
    } catch (err) {
      setError("Failed to load monthly dashboard.");
    }
  };

  // Fetch yearly dashboard
  const fetchYearlyDashboard = async () => {
    try {
      const res = await axios.get(
        `${config.apiUrl}/dashboard/yearly`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setYearlyData(res.data);
    } catch (err) {
      setError("Failed to load yearly dashboard.");
    }
  };

  // Fetch investments summary
  /*const fetchInvestmentsSummary = async () => {
    try {
      const res = await axios.get(
        "http://192.168.1.85:5000/api/dashboard/investments-summary",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Map the API result to include gain/loss percentage for the chart
      const data = res.data.map((inv) => {
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
      });

      setInvestmentsData(data);
    } catch (err) {
      setError("Failed to load investments summary.");
    }
  };
  */

  // Fetch all data on load and when selectedYear changes
  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetchMonthlyDashboard(selectedYear),
      fetchYearlyDashboard(),
      //fetchInvestmentsSummary(),
    ]).finally(() => setLoading(false));
  }, [selectedYear]);

  // Handle year select change
  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  if (loading) {
    return <div className="text-center mt-5">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-3">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Dashboard</h2>

      {/* Year selector for monthly graph */}
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
          {/* You can adjust the years range as needed */}
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

      {/* Monthly Income and Expenses Bar Chart */}
      <h4>Monthly Income & Expenses ({selectedYear})</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={monthlyData}
          margin={{ top: 20, right: 30, bottom: 20, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" fill="#4caf50" name="Income" />
          <Bar dataKey="expenses" fill="#f44336" name="Expenses" />
        </BarChart>
      </ResponsiveContainer>

      {/* Yearly Income and Expenses Line Chart */}
      <h4 className="mt-5">Yearly Income & Expenses</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={yearlyData}
          margin={{ top: 20, right: 30, bottom: 20, left: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#4caf50"
            name="Income"
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#f44336"
            name="Expenses"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Investments Summary Bar Chart */}
      <h4 className="mt-5">Investments Summary (Total Invested & Gain/Loss)</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={investmentsData}
          margin={{ top: 20, right: 30, bottom: 20, left: 0 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            dataKey="ticker"
            type="category"
            tick={{ fontSize: 14 }}
            width={80}
          />
          <Tooltip formatter={(value) => value.toFixed(2)} />
          <Legend />
          <Bar
            dataKey="amountInvested"
            fill="#2196f3"
            name="Total Invested (€)"
          />
          <Bar
            dataKey="gainLoss"
            fill="#ff9800"
            name="Gain/Loss (€)"
            // Use conditional coloring on positive/negative values is complex here, keeping default
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DashboardPage;

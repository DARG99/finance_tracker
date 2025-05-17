import React, { useEffect, useState } from "react";
import BudgetCard from "../components/BudgetCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [view, setView] = useState("monthly"); // monthly or yearly
  const [budgets, setBudgets] = useState([
    { id: 1, category: "Groceries", budgeted: 200, spent: 54.75 },
    { id: 2, category: "Transportation", budgeted: 100, spent: 20 },
  ]);

  const monthlyData = [
    { month: "Jan", income: 1200, expenses: 900 },
    { month: "Feb", income: 1300, expenses: 950 },
    { month: "Mar", income: 1250, expenses: 870 },
    { month: "Apr", income: 1400, expenses: 1100 },
  ];

  const yearlyData = [
    { year: "2021", income: 15000, expenses: 12000 },
    { year: "2022", income: 16500, expenses: 13000 },
    { year: "2023", income: 18000, expenses: 14000 },
  ];

  return (
    <div className="p-4">
      <h1 className="mb-4">Welcome to your Dashboard</h1>

      <h3 className="mb-3">Budgets</h3>
      <div className="row mb-4">
        {budgets.map((b) => (
          <div key={b.id} className="col-12 col-md-6 col-lg-4 mb-3">
            <BudgetCard
              category={b.category}
              budgeted={b.budgeted}
              spent={b.spent}
            />
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Spending & Earnings Overview</h4>
        <div>
          <button
            className={`btn btn-sm me-2 ${
              view === "monthly" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setView("monthly")}
          >
            Monthly
          </button>
          <button
            className={`btn btn-sm ${
              view === "yearly" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setView("yearly")}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm p-3">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={view === "monthly" ? monthlyData : yearlyData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={view === "monthly" ? "month" : "year"} />
            <YAxis tickFormatter={(value) => `€${value.toLocaleString()}`} />

            <Tooltip />
            <Legend />
            <Bar dataKey="income" fill="#28a745" />
            <Bar dataKey="expenses" fill="#dc3545" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;

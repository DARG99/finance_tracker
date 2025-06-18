const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const userRoutes = require("./routes/users");
const transactionRoutes = require("./routes/transactions");
const categoryRoutes = require("./routes/categories");
const investmentsRoutes = require("./routes/investments");
const fundingSourcesRoutes = require("./routes/fundingSources");
const dashboardRoutes = require("./routes/dashboard");
const reportRoutes = require("./routes/reportRoutes");
const investmentReportRoutes = require("./routes/investmentReportRoutes");
const { scheduleMonthlyReports } = require("./controllers/investmentReportController");
const { scheduleMonthlyReport } = require("./controllers/reportController");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/investments", investmentsRoutes);
app.use("/api/fundingsources", fundingSourcesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/investment-reports", investmentReportRoutes);

app.get("/", (req, res) => {
  res.send("Finance Tracker API is running");
});

// Start both monthly report schedulers
scheduleMonthlyReport(); // For regular transactions
scheduleMonthlyReports(); // For investment transactions

app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON PORT ${PORT}`);
});

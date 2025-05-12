import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Transaction from "./components/Transactions"
import ProtectedRoute from "./ProtectedRoute";
import AddTransaction from "./components/AddTransaction";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register/>} />
      <Route path="/addtransaction" element={<AddTransaction/>} />

      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <Transaction />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

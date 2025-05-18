import { NavLink } from "react-router-dom";
import { House, ListUl, PlusLg } from "react-bootstrap-icons";
import { TrendingUp } from "lucide-react";

export default function BottomNav() {
  return (
    <nav className="navbar fixed-bottom bg-light border-top d-flex justify-content-around py-2 pb-4">
      <NavLink
        to="/dashboard"
        className="text-center text-secondary text-decoration-none"
      >
        <House size={24} />
        <div style={{ fontSize: "0.75rem" }}>Home</div>
      </NavLink>
      <NavLink
        to="/transactions"
        className="text-center text-secondary text-decoration-none"
      >
        <ListUl size={24} />
        <div style={{ fontSize: "0.75rem" }}>Transactions</div>
      </NavLink>
      <NavLink
        to="/investments"
        className="text-center text-secondary text-decoration-none"
      >
        <TrendingUp size={24} />
        <div style={{ fontSize: "0.75rem" }}>Investments</div>
      </NavLink>
      <NavLink
        to="/addtransaction"
        className="text-center text-secondary text-decoration-none"
      >
        <PlusLg size={24} />
        <div style={{ fontSize: "0.75rem" }}>Add</div>
      </NavLink>
    </nav>
  );
}

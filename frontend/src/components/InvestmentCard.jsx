export default function BudgetCard({ Name, ticker, totaInvested }) {
    const remaining = budgeted - spent;
    const progress = Math.min((spent / budgeted) * 100, 100);
  
    return (
      <div className="border rounded p-3 mb-3" style={{ borderColor: "red" }}>
        <div className="d-flex justify-content-between fw-bold text-danger">
          <div>{category}</div>
          <div>${budgeted.toFixed(2)} Budgeted</div>
        </div>
  
        <div className="progress my-2" style={{ height: "10px" }}>
          <div
            className="progress-bar bg-danger"
            style={{ width: `${progress}%` }}
          />
        </div>
  
        <div className="d-flex justify-content-between small text-muted">
          <div>${spent.toFixed(2)} spent</div>
          <div>${remaining.toFixed(2)} remaining</div>
        </div>
      </div>
    );
  }
  
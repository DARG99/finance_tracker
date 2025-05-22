export default function InvestmentCard({ name, ticker, onClick }) {
  return (
    <div className="border rounded p-3 mb-3 bg-light shadow-sm" onClick={onClick} role="button">
      <div className="fw-bold mb-1">
        {name} ({ticker})
      </div>
  </div>
 
  );
}

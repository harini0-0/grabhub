import { useState, useEffect } from "react";

const API = "http://localhost:5050/api";

export default function Billing({ customerId }) {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await fetch(`${API}/billing/customer/${customerId}`);
        const data = await res.json();
        setBills(Array.isArray(data) ? data : []);
      } catch (err) { 
        console.error(err);
        setBills([]);
      }
    };
    fetchBills();
  }, [customerId]);

  const getBadge = (status) => {
    if (status === "Completed") return { background: "#d4edda", color: "#155724" };
    if (status === "Refunded") return { background: "#f8d7da", color: "#721c24" };
    if (status === "Failed") return { background: "#f8d7da", color: "#721c24" };
    return { background: "#fff3cd", color: "#856404" };
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Billing History</h2>
      {bills.length === 0 ? <p>No billing records.</p> : (
        <table style={tableStyle}>
          <thead>
            <tr><th>Date</th><th>Restaurant</th><th>Type</th><th>Amount</th><th>Payment</th><th>Status</th></tr>
          </thead>
          <tbody>
            {bills.map((b) => (
              <tr key={b.billing_id}>
                <td>{new Date(b.transaction_date).toLocaleDateString()}</td>
                <td>{b.restaurant_name}</td>
                <td>{b.order_type}</td>
                <td>${Number(b.billing_amount).toFixed(2)}</td>
                <td>{b.payment_method}{b.card_last_four ? ` ···${b.card_last_four}` : ""}</td>
                <td><span style={{ ...badgeStyle, ...getBadge(b.payment_status) }}>{b.payment_status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const tableStyle = { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" };
const badgeStyle = { padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "600" };

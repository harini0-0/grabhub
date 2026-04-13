import { useState, useEffect } from "react";

const API = "http://localhost:5050/api";

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const customerId = 1;

  useEffect(() => { fetchSubs(); }, []);

  const fetchSubs = async () => {
    try {
      const res = await fetch(`${API}/subscriptions/customer/${customerId}`);
      setSubscriptions(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const planType = e.target.plan_type.value;
    try {
      const res = await fetch(`${API}/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: customerId, plan_type: planType })
      });
      const data = await res.json();
      setMessage(data.message);
      setShowForm(false);
      fetchSubs();
    } catch (err) { setMessage("Subscription failed"); }
  };

  const handleToggleRenew = async (id) => {
    try {
      const res = await fetch(`${API}/subscriptions/${id}/toggle-renew`, { method: "PUT" });
      const data = await res.json();
      setMessage(data.message);
      fetchSubs();
    } catch (err) { setMessage("Update failed"); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel your GrabHub+ subscription?")) return;
    try {
      const res = await fetch(`${API}/subscriptions/${id}/cancel`, { method: "PUT" });
      const data = await res.json();
      setMessage(data.message);
      fetchSubs();
    } catch (err) { setMessage("Cancellation failed"); }
  };

  const getBadge = (status) => {
    if (status === "Active") return { background: "#d4edda", color: "#155724" };
    if (status === "Cancelled") return { background: "#f8d7da", color: "#721c24" };
    return { background: "#e2e3e5", color: "#383d41" };
  };

  if (showForm) {
    return (
      <div style={{ padding: "1rem" }}>
        <button onClick={() => setShowForm(false)} style={btnStyle}>← Back</button>
        <h2>Subscribe to GrabHub+</h2>
        <form onSubmit={handleSubscribe} style={cardStyle}>
          <div style={{ marginBottom: "1rem" }}>
            <label><strong>Choose Your Plan</strong></label>
            <select name="plan_type" required style={inputStyle}>
              <option value="Monthly">Monthly — $9.99/mo</option>
              <option value="Annual">Annual — $7.99/mo (save 20%!)</option>
            </select>
          </div>
          <p style={{ color: "#888", marginBottom: "1rem" }}>Benefits: Free delivery, exclusive discounts, priority support.</p>
          <button type="submit" style={{ ...btnStyle, background: "#28a745", color: "#fff" }}>Subscribe Now</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>GrabHub+</h2>
        <button onClick={() => setShowForm(true)} style={{ ...btnStyle, background: "#28a745", color: "#fff" }}>+ Subscribe</button>
      </div>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {subscriptions.length === 0 ? (
        <div style={cardStyle}>
          <h3>No active subscription</h3>
          <p>Subscribe to GrabHub+ for free delivery and exclusive discounts!</p>
        </div>
      ) : (
        subscriptions.map((s) => (
          <div key={s.subscription_id} style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>{s.plan_type} Plan — ${Number(s.monthly_fee).toFixed(2)}/mo</h3>
              <span style={{ ...badgeStyle, ...getBadge(s.status) }}>{s.status}</span>
            </div>
            <p><strong>Start:</strong> {new Date(s.start_date).toLocaleDateString()}</p>
            <p><strong>End:</strong> {new Date(s.end_date).toLocaleDateString()}</p>
            <p><strong>Auto-Renew:</strong> {s.auto_renew ? "Yes" : "No"}</p>
            {s.status === "Active" && (
              <div style={{ marginTop: "0.5rem" }}>
                <button onClick={() => handleToggleRenew(s.subscription_id)} style={{ ...btnSmStyle, background: "#6c757d" }}>
                  {s.auto_renew ? "Turn Off Auto-Renew" : "Turn On Auto-Renew"}
                </button>
                <button onClick={() => handleCancel(s.subscription_id)} style={{ ...btnSmStyle, background: "#dc3545", marginLeft: "0.3rem" }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

const cardStyle = { background: "#fff", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" };
const badgeStyle = { padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "600" };
const btnStyle = { padding: "0.5rem 1rem", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", background: "#eee" };
const btnSmStyle = { padding: "0.3rem 0.6rem", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem", color: "#fff" };
const inputStyle = { width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "6px", fontSize: "0.9rem", marginTop: "0.3rem" };

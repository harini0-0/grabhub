import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5050/api";

function statusBadgeClass(status = "") {
  return `badge badge-status-${status.toLowerCase().replace(/\s+/g, "-")}`;
}

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/delivery/orders`)
      .then(res => res.json())
      .then(data => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="delivery-shell">
      <nav className="delivery-navbar">
        <span className="delivery-navbar-brand">Grab<span>Hub</span></span>
        <span className="delivery-navbar-pill">Delivery Partner</span>
      </nav>

      <div className="delivery-content">
        <h1 className="delivery-page-title">Your Orders</h1>
        <p className="delivery-page-sub">
          {loading ? "Loading…" : `${orders.length} order${orders.length !== 1 ? "s" : ""} assigned`}
        </p>

        {loading && (
          <div className="loading-state" style={{ color: "rgba(255,255,255,0.4)" }}>
            <div className="loading-spinner" style={{ borderColor: "rgba(255,255,255,0.15)", borderTopColor: "var(--primary)" }} />
            <span className="loading-text" style={{ color: "rgba(255,255,255,0.4)" }}>Loading orders…</span>
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-text" style={{ color: "white" }}>No orders assigned</p>
            <p className="empty-state-sub" style={{ color: "rgba(255,255,255,0.4)" }}>
              Check back soon — new orders will appear here.
            </p>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="delivery-orders-list">
            {orders.map(order => (
              <div key={order.order_id} className="delivery-order-card">
                <span className="delivery-order-id">#{order.order_id}</span>

                <div className="delivery-order-main">
                  <div className="delivery-order-restaurant">
                    {order.restaurant_name}
                  </div>
                  <div className="delivery-order-address">
                    📍 {order.street_name}, {order.city}, {order.state}
                  </div>
                </div>

                <span className={statusBadgeClass(order.status)}>
                  {order.status}
                </span>

                <span className="delivery-order-amount">
                  ${parseFloat(order.total_amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

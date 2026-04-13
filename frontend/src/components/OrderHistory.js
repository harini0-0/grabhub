import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5050/api";

const STATUS_CONFIG = {
  "Delivered":          { bg: "#ECFDF5", color: "#065F46" },
  "Cancelled":          { bg: "#FFF1F2", color: "#BE123C" },
  "Pending":            { bg: "#FFFBEB", color: "#92400E" },
  "Confirmed":          { bg: "#EFF6FF", color: "#1D4ED8" },
  "Preparing":          { bg: "#FFF7ED", color: "#C2410C" },
  "Out for Delivery":   { bg: "#F0FDF4", color: "#15803D" },
};

function statusStyle(status) {
  return STATUS_CONFIG[status] || { bg: "var(--bg)", color: "var(--text-sub)" };
}

function OrderCard({ order, customerId }) {
  const [expanded, setExpanded]       = useState(false);
  const [items, setItems]             = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);

  const toggle = async () => {
    if (!expanded && items === null) {
      setLoadingItems(true);
      try {
        const data = await fetch(
          `${BASE_URL}/customers/${customerId}/orders/${order.order_id}/items`
        ).then(r => r.json());
        setItems(Array.isArray(data) ? data : []);
      } finally {
        setLoadingItems(false);
      }
    }
    setExpanded(e => !e);
  };

  const style = statusStyle(order.status);
  const total = parseFloat(order.total_amount);

  return (
    <div className="order-card">
      <div className="order-card-header" onClick={toggle}>
        <div className="order-card-left">
          <p className="order-restaurant">{order.restaurant_name}</p>
          <p className="order-location">📍 {order.city}, {order.state}</p>
          {order.order_type && (
            <span className="order-type-pill">{order.order_type}</span>
          )}
        </div>
        <div className="order-card-right">
          <span
            className="order-status-badge"
            style={{ background: style.bg, color: style.color }}
          >
            {order.status}
          </span>
          <p className="order-total">
            {isNaN(total) ? "—" : `$${total.toFixed(2)}`}
          </p>
          <span className="order-expand-icon">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div className="order-items-panel">
          {loadingItems && (
            <p className="order-items-loading">Loading items…</p>
          )}

          {!loadingItems && items !== null && items.length === 0 && (
            <p className="order-items-empty">No item details on record.</p>
          )}

          {!loadingItems && items && items.length > 0 && (
            <div className="order-items-list">
              {items.map((item, i) => {
                const lineTotal =
                  item.unit_price != null
                    ? parseFloat(item.unit_price) * item.quantity
                    : null;
                return (
                  <div key={i} className="order-item-row">
                    <span className="order-item-qty">×{item.quantity}</span>
                    <span className="order-item-name">{item.item_name}</span>
                    {item.category && (
                      <span className="order-item-category">{item.category}</span>
                    )}
                    {lineTotal !== null && (
                      <span className="order-item-price">
                        ${lineTotal.toFixed(2)}
                      </span>
                    )}
                  </div>
                );
              })}
              <div className="order-items-total-row">
                <span>Order Total</span>
                <span>{isNaN(total) ? "—" : `$${total.toFixed(2)}`}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrderHistory({ customerId }) {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOrders([]);
    setLoading(true);
    fetch(`${BASE_URL}/customers/${customerId}/orders`)
      .then(r => r.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [customerId]);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Order History</h2>
        <p className="page-sub">
          {loading ? "" : `${orders.length} order${orders.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          <span className="loading-text">Loading orders…</span>
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <p className="empty-state-text">No orders yet</p>
          <p className="empty-state-sub">This customer hasn't placed any orders.</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="order-list">
          {orders.map(order => (
            <OrderCard key={order.order_id} order={order} customerId={customerId} />
          ))}
        </div>
      )}
    </div>
  );
}

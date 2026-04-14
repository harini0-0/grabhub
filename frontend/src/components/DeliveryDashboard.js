import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5050/api";

function statusBadgeClass(status = "") {
  return `badge badge-status-${status.toLowerCase().replace(/\s+/g, "-")}`;
}

function availClass(status = "") {
  const s = status.toLowerCase();
  if (s === "online" || s === "available") return "badge partner-avail-online";
  if (s === "busy")   return "badge partner-avail-busy";
  return "badge partner-avail-offline";
}

function initials(first = "", last = "") {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

// ── Delivery partner info card ────────────────────────────────────────────────

function PartnerInfoCard({ partner }) {
  if (!partner) return null;

  const rating = parseFloat(partner.rating);

  return (
    <div className="partner-info-card">
      <div className="partner-avatar">
        {initials(partner.first_name, partner.last_name)}
      </div>

      <div className="partner-info-main">
        <p className="partner-name">
          {partner.first_name} {partner.last_name}
        </p>
        <p className="partner-contact">
          {partner.email}&nbsp;&nbsp;·&nbsp;&nbsp;{partner.phone}
        </p>
      </div>

      <div className="partner-stats">
        <div className="partner-stat">
          <span className="partner-stat-value" style={{ color: "#F59E0B", letterSpacing: 1 }}>
            {isNaN(rating) ? "—" : rating.toFixed(1)}
          </span>
          <span className="partner-stat-label">Rating</span>
        </div>
        <div className="partner-stat">
          <span className="partner-stat-value">{formatDate(partner.date_joined)}</span>
          <span className="partner-stat-label">Joined</span>
        </div>
        <div className="partner-stat">
          <span className={availClass(partner.availability_status)}>
            {partner.availability_status ?? "—"}
          </span>
          <span className="partner-stat-label" style={{ marginTop: 4 }}>Status</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DeliveryDashboard({ onBack }) {
  const [partners,   setPartners]   = useState([]);
  const [partnerId,  setPartnerId]  = useState(1);
  const [partner,    setPartner]    = useState(null);
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);

  // Load partner list once on mount
  useEffect(() => {
    fetch(`${BASE_URL}/delivery/partners`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setPartners(data); })
      .catch(() => {});
  }, []);

  // Reload partner details whenever selected partner changes
  useEffect(() => {
    setPartner(null);
    setLoading(true);
    Promise.all([
      fetch(`${BASE_URL}/delivery/partner/${partnerId}`).then(r => r.json()),
      fetch(`${BASE_URL}/delivery/orders`).then(r => r.json()),
    ]).then(([partnerData, ordersData]) => {
      setPartner(partnerData);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [partnerId]);

  return (
    <div className="delivery-shell">
      <nav className="delivery-navbar">
        <span className="delivery-navbar-brand">Grab<span>Hub</span></span>
        <span className="delivery-navbar-pill">Delivery Partner</span>

        {/* Partner switcher */}
        {partners.length > 0 && (
          <div className="navbar-switcher" style={{ marginLeft: "auto" }}>
            <span className="navbar-switcher-label" style={{ color: "rgba(255,255,255,0.45)" }}>
              Viewing as
            </span>
            <select
              className="delivery-partner-select"
              value={partnerId}
              onChange={e => setPartnerId(Number(e.target.value))}
            >
              {partners.map(p => (
                <option key={p.partner_id} value={p.partner_id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {onBack && (
          <button className="delivery-back-btn" onClick={onBack}>← Exit</button>
        )}
      </nav>

      <div className="delivery-content">

        <PartnerInfoCard partner={partner} />

        <h1 className="delivery-page-title">Your Orders</h1>
        <p className="delivery-page-sub">
          {loading
            ? "Loading…"
            : `${orders.length} order${orders.length !== 1 ? "s" : ""} assigned`}
        </p>

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"
              style={{ borderColor: "rgba(255,255,255,0.15)", borderTopColor: "var(--primary)" }} />
            <span className="loading-text" style={{ color: "rgba(255,255,255,0.4)" }}>
              Loading…
            </span>
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
                  <div className="delivery-order-restaurant">{order.restaurant_name}</div>
                  <div className="delivery-order-address">
                    📍 {order.street_name}, {order.city}, {order.state}
                  </div>
                </div>

                <span className={statusBadgeClass(order.status)}>{order.status}</span>

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

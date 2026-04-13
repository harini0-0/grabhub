import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5050/api";

function statusClass(status = "") {
  return `badge badge-status-${status.toLowerCase().replace(/\s+/g, "-")}`;
}

export default function MenuView({ restaurant, goBack }) {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/restaurants/${restaurant.restaurant_id}/menu`)
      .then(res => res.json())
      .then(data => { setMenu(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [restaurant]);

  const rating = parseFloat(restaurant.average_rating);

  return (
    <div style={{ margin: "-32px", background: "var(--bg)" }}>
      <div className="menu-header">
        <button className="btn-ghost" onClick={goBack}>← Back</button>
        <div className="menu-header-info">
          <h2 className="menu-header-title">{restaurant.restaurant_name}</h2>
          <p className="menu-header-sub">
            📍 {restaurant.city}, {restaurant.state}
            {!isNaN(rating) && <>&nbsp;&nbsp;⭐ {rating.toFixed(1)}</>}
          </p>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          <span className="loading-text">Loading menu…</span>
        </div>
      )}

      {!loading && menu.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-text">No items available</p>
          <p className="empty-state-sub">This restaurant hasn't published their menu yet.</p>
        </div>
      )}

      {!loading && menu.length > 0 && (
        <>
          <p className="menu-section-title">{menu.length} item{menu.length !== 1 ? "s" : ""}</p>
          <div className="menu-grid">
            {menu.map(item => (
              <div key={item.item_id} className="menu-item-card">
                <h4 className="menu-item-name">{item.item_name}</h4>
                <div className="menu-item-meta">
                  {item.category && (
                    <span className="badge badge-category">{item.category}</span>
                  )}
                  {item.spice_level > 0 && (
                    <span className="badge badge-spice">🌶️ {item.spice_level}/5</span>
                  )}
                  {item.is_available === 0 && (
                    <span className={statusClass("cancelled")}>Unavailable</span>
                  )}
                </div>
                <p className="menu-item-price">
                  ${parseFloat(item.price).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

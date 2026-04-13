import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5050/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

function StarDisplay({ value, max = 5 }) {
  return (
    <span>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ color: i < Math.round(value) ? "#F59E0B" : "#D1D5DB", fontSize: 13 }}>★</span>
      ))}
    </span>
  );
}

// ── Hours Panel ───────────────────────────────────────────────────────────────

function HoursPanel({ restaurantId }) {
  const [hours, setHours] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/restaurants/${restaurantId}/hours`)
      .then(r => r.json())
      .then(data => { setHours(data); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [restaurantId]);

  if (!loaded) {
    return (
      <div className="hours-panel">
        <span className="loading-text" style={{ color: "rgba(255,255,255,0.5)" }}>Loading hours…</span>
      </div>
    );
  }

  return (
    <div className="hours-panel">
      <div className="hours-grid">
        {hours.map(row => (
          <div key={row.day_of_week} className="hours-row">
            <span className="hours-day">{row.day_of_week.slice(0, 3)}</span>
            {row.is_closed
              ? <span className="hours-closed">Closed</span>
              : <span className="hours-time">
                  {formatTime(row.opening_time)} – {formatTime(row.closing_time)}
                </span>
            }
          </div>
        ))}
        {hours.length === 0 && (
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>No hours on record.</span>
        )}
      </div>
    </div>
  );
}

// ── Reviews Section ───────────────────────────────────────────────────────────

const RATINGS = [1, 2, 3, 4, 5];

function ReviewsSection({ restaurant }) {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ food_rating: 5, delivery_rating: 5, overall_rating: 5, comment: "" });
  const [msg, setMsg] = useState(null); // { type: "success"|"error", text }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/reviews/${restaurant.restaurant_id}`)
      .then(r => r.json())
      .then(setReviews)
      .catch(() => {});
  }, [restaurant]);

  const submit = async () => {
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await fetch(`${BASE_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurant_id: restaurant.restaurant_id, ...form })
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: data.error || "Failed to submit review." });
      } else {
        setMsg({ type: "success", text: "Review submitted! Thank you." });
        setShowForm(false);
        setForm({ food_rating: 5, delivery_rating: 5, overall_rating: 5, comment: "" });
        // Reload reviews
        const updated = await fetch(`${BASE_URL}/reviews/${restaurant.restaurant_id}`).then(r => r.json());
        setReviews(updated);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reviews-section">
      <div className="reviews-section-header">
        <h3 className="reviews-section-title">
          Reviews {reviews.length > 0 && <span style={{ color: "var(--text-sub)", fontWeight: 500 }}>({reviews.length})</span>}
        </h3>
        {!showForm && (
          <button className="btn-primary" style={{ minWidth: 130 }} onClick={() => { setShowForm(true); setMsg(null); }}>
            + Write a Review
          </button>
        )}
      </div>

      {/* Add Review Form */}
      {showForm && (
        <div className="review-form" style={{ marginBottom: 20 }}>
          <p className="review-form-title">Rate your experience at {restaurant.restaurant_name}</p>

          {msg && <div className={`review-form-msg ${msg.type}`}>{msg.text}</div>}

          <div className="review-form-grid">
            {["food_rating", "delivery_rating", "overall_rating"].map(key => (
              <div key={key} className="review-form-field">
                <label className="review-form-label">
                  {key === "food_rating" ? "Food" : key === "delivery_rating" ? "Delivery" : "Overall"}
                </label>
                <select className="review-form-select" value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))}>
                  {RATINGS.map(r => <option key={r} value={r}>{r} ★</option>)}
                </select>
              </div>
            ))}
          </div>

          <textarea
            className="review-form-textarea"
            placeholder="Share your thoughts (optional)…"
            value={form.comment}
            onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
          />

          <div className="review-form-actions">
            <button className="btn-secondary" onClick={() => { setShowForm(false); setMsg(null); }}>
              Cancel
            </button>
            <button className="btn-primary" onClick={submit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
          </div>
        </div>
      )}

      {msg && !showForm && <div className={`review-form-msg ${msg.type}`}>{msg.text}</div>}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="empty-state" style={{ padding: "32px 0" }}>
          <div className="empty-state-icon">💬</div>
          <p className="empty-state-text">No reviews yet</p>
          <p className="empty-state-sub">Be the first to share your experience.</p>
        </div>
      ) : (
        <div className="review-list">
          {reviews.map(r => (
            <div key={r.review_id} className="review-card">
              <div className="review-card-header">
                <span className="review-author">{r.first_name} {r.last_name}</span>
                <span className="review-date">
                  {r.review_date ? new Date(r.review_date).toLocaleDateString() : ""}
                </span>
              </div>
              <div className="review-stars">
                <span className="review-star-group">
                  <strong>Food</strong> <StarDisplay value={r.food_rating} />
                </span>
                <span className="review-star-group">
                  <strong>Delivery</strong> <StarDisplay value={r.delivery_rating} />
                </span>
                <span className="review-star-group">
                  <strong>Overall</strong> <StarDisplay value={r.overall_rating} />
                </span>
              </div>
              {r.comment && <p className="review-comment">"{r.comment}"</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main MenuView ─────────────────────────────────────────────────────────────

export default function MenuView({ restaurant, goBack, customerId }) {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHours, setShowHours] = useState(false);
  // map of item_id → favourite_id (null means not favourited)
  const [favMap, setFavMap] = useState({});

  // Load menu and favourites in parallel
  useEffect(() => {
    Promise.all([
      fetch(`${BASE_URL}/restaurants/${restaurant.restaurant_id}/menu`).then(r => r.json()),
      fetch(`${BASE_URL}/favourites/${customerId}`).then(r => r.json())
    ]).then(([menuData, favData]) => {
      setMenu(menuData);
      // Build favMap: { item_id: favourite_id }
      const map = {};
      favData.forEach(f => {
        if (f.restaurant_id === restaurant.restaurant_id) {
          map[f.item_id] = f.favourite_id;
        }
      });
      setFavMap(map);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [restaurant]);

  const toggleFav = async (item) => {
    const itemId = item.item_id;
    if (favMap[itemId] != null) {
      // Remove favourite
      const favId = favMap[itemId];
      await fetch(`${BASE_URL}/favourites/${favId}`, { method: "DELETE" });
      setFavMap(m => { const n = { ...m }; delete n[itemId]; return n; });
    } else {
      // Add favourite
      const res = await fetch(`${BASE_URL}/favourites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: customerId, restaurant_id: restaurant.restaurant_id, item_id: itemId })
      });
      if (res.ok) {
        // Re-fetch to get the new favourite_id
        const favData = await fetch(`${BASE_URL}/favourites/${customerId}`).then(r => r.json());
        const map = {};
        favData.forEach(f => {
          if (f.restaurant_id === restaurant.restaurant_id) map[f.item_id] = f.favourite_id;
        });
        setFavMap(map);
      }
    }
  };

  const rating = parseFloat(restaurant.average_rating);

  return (
    <div style={{ margin: "-32px", background: "var(--bg)" }}>
      {/* Header */}
      <div className="menu-header">
        <button className="btn-ghost" onClick={goBack}>← Back</button>
        <div className="menu-header-info">
          <h2 className="menu-header-title">{restaurant.restaurant_name}</h2>
          <p className="menu-header-sub">
            📍 {restaurant.city}, {restaurant.state}
            {!isNaN(rating) && <>&nbsp;&nbsp;⭐ {rating.toFixed(1)}</>}
          </p>
        </div>
        <button className="hours-toggle-btn" onClick={() => setShowHours(s => !s)}>
          {showHours ? "Hide Hours" : "🕐 Hours"}
        </button>
      </div>

      {/* Hours panel */}
      {showHours && <HoursPanel restaurantId={restaurant.restaurant_id} />}

      {/* Menu */}
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
            {menu.map(item => {
              const isFav = favMap[item.item_id] != null;
              return (
                <div key={item.item_id} className="menu-item-card">
                  <div className="menu-item-top">
                    <h4 className="menu-item-name" style={{ marginBottom: 0 }}>{item.item_name}</h4>
                    <button
                      className="fav-btn"
                      title={isFav ? "Remove from favourites" : "Add to favourites"}
                      onClick={() => toggleFav(item)}
                    >
                      {isFav ? "❤️" : "🤍"}
                    </button>
                  </div>
                  <div className="menu-item-meta">
                    {item.category && <span className="badge badge-category">{item.category}</span>}
                    {item.spice_level > 0 && <span className="badge badge-spice">🌶️ {item.spice_level}/5</span>}
                    {item.is_vegetarian === 1 && <span className="badge badge-veg">Veg</span>}
                    {item.is_vegan === 1 && <span className="badge badge-veg">Vegan</span>}
                    {item.is_available === 0 && <span className="badge" style={{ background: "var(--danger-light)", color: "var(--danger)" }}>Unavailable</span>}
                  </div>
                  <p className="menu-item-price">${parseFloat(item.price).toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Reviews */}
      {!loading && <ReviewsSection restaurant={restaurant} />}
    </div>
  );
}

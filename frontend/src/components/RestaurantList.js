import { useEffect, useState } from "react";
import MenuView from "./MenuView";

const BASE_URL = "http://localhost:5050/api";

const RESTAURANT_EMOJIS = ["🍕", "🍔", "🌮", "🍜", "🍱", "🥘", "🍛", "🥗", "🍣", "🌯", "🍝", "🥙"];

export default function RestaurantList({ customerId, initialRestaurant = null, onClearInitial }) {
  const [restaurants, setRestaurants] = useState([]);
  const [selected, setSelected] = useState(initialRestaurant);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/restaurants`)
      .then(res => res.json())
      .then(data => { setRestaurants(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Respond to subsequent prop changes (e.g. user navigates to a different
  // favourite without leaving the Restaurants tab)
  useEffect(() => {
    if (initialRestaurant) setSelected(initialRestaurant);
  }, [initialRestaurant]);

  const handleGoBack = () => {
    setSelected(null);
    if (onClearInitial) onClearInitial();
  };

  if (selected) {
    return <MenuView restaurant={selected} goBack={handleGoBack} customerId={customerId} />;
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Restaurants</h2>
        <p className="page-sub">Browse restaurants and explore their menus</p>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          <span className="loading-text">Finding restaurants near you…</span>
        </div>
      )}

      {!loading && restaurants.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🍽️</div>
          <p className="empty-state-text">No restaurants found</p>
          <p className="empty-state-sub">Check back soon — more are on the way.</p>
        </div>
      )}

      {!loading && restaurants.length > 0 && (
        <div className="restaurant-grid">
          {restaurants.map(r => {
            const emoji = RESTAURANT_EMOJIS[r.restaurant_id % RESTAURANT_EMOJIS.length];
            const rating = parseFloat(r.average_rating);
            return (
              <div key={r.restaurant_id} className="restaurant-card">
                <div className="restaurant-card-header">{emoji}</div>
                <div className="restaurant-card-body">
                  <h3 className="restaurant-name">{r.restaurant_name}</h3>
                  <p className="restaurant-location">📍 {r.city}, {r.state}</p>
                  <div className="restaurant-meta">
                    <span className="rating-pill">
                      ⭐ {isNaN(rating) ? "—" : rating.toFixed(1)}
                    </span>
                  </div>
                  <button className="btn-primary full" onClick={() => setSelected(r)}>
                    View Menu
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

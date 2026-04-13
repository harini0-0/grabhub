import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5050/api";

const REC_EMOJIS  = ["🍕", "🌮", "🍜", "🍛", "🥗", "🍱", "🥘", "🍣", "🌯", "🍔"];
const FAV_EMOJIS  = ["❤️", "🤍", "💛", "💚", "💙", "🧡", "💜"];

export default function Recommendations({ customerId, goToRestaurant }) {
  const [recs, setRecs]           = useState([]);
  const [favs, setFavs]           = useState([]);
  const [recsLoading, setRecsLoading] = useState(true);
  const [favsLoading, setFavsLoading] = useState(true);

  useEffect(() => {
    // Reset state when customer changes
    setRecs([]);
    setFavs([]);
    setRecsLoading(true);
    setFavsLoading(true);

    // Load recommendations and favourites in parallel
    fetch(`${BASE_URL}/profile/${customerId}/recommendations`)
      .then(r => r.json())
      .then(data => {
        setRecs(data?.recommendations ?? []);
        setRecsLoading(false);
      })
      .catch(() => setRecsLoading(false));

    fetch(`${BASE_URL}/favourites/${customerId}`)
      .then(r => r.json())
      .then(data => {
        setFavs(Array.isArray(data) ? data : []);
        setFavsLoading(false);
      })
      .catch(() => setFavsLoading(false));
  }, [customerId]);

  const handleFavClick = (fav) => {
    goToRestaurant({
      restaurant_id:   fav.restaurant_id,
      restaurant_name: fav.restaurant_name,
      city:            fav.city,
      state:           fav.state,
      average_rating:  fav.average_rating,
    });
  };

  return (
    <div>
      {/* ── Recommendations ─────────────────────────────── */}
      <div className="page-header">
        <h2 className="page-title">For You</h2>
        <p className="page-sub">Personalised picks based on your taste profile</p>
      </div>

      {recsLoading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          <span className="loading-text">Personalising your feed…</span>
        </div>
      )}

      {!recsLoading && recs.length === 0 && (
        <div className="empty-state" style={{ padding: "32px 0" }}>
          <div className="empty-state-icon">🤔</div>
          <p className="empty-state-text">No picks yet</p>
          <p className="empty-state-sub">Generate your taste profile first to unlock recommendations.</p>
        </div>
      )}

      {!recsLoading && recs.length > 0 && (
        <div className="rec-grid">
          {recs.map((item, idx) => (
            <div key={item.item_id} className="rec-card">
              <div className="rec-card-emoji">{REC_EMOJIS[idx % REC_EMOJIS.length]}</div>
              <h4 className="rec-card-name">{item.item_name}</h4>
              {item.spice_level != null && (
                <>
                  <p className="rec-card-label">Spice level</p>
                  <div className="spice-bar">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`spice-dot${i <= item.spice_level ? " active" : ""}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Favourites ──────────────────────────────────── */}
      <hr className="for-you-divider" />

      <div className="for-you-section-header">
        <h3 className="for-you-section-title">Your Favourites</h3>
        {!favsLoading && favs.length > 0 && (
          <span className="for-you-section-count">{favs.length} saved item{favs.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {favsLoading && (
        <div className="loading-state" style={{ padding: "24px 0" }}>
          <div className="loading-spinner" />
          <span className="loading-text">Loading favourites…</span>
        </div>
      )}

      {!favsLoading && favs.length === 0 && (
        <div className="empty-state" style={{ padding: "24px 0" }}>
          <div className="empty-state-icon">🤍</div>
          <p className="empty-state-text">No favourites yet</p>
          <p className="empty-state-sub">Tap the ❤️ on any menu item to save it here.</p>
        </div>
      )}

      {!favsLoading && favs.length > 0 && (
        <div className="fav-items-grid">
          {favs.map((fav, idx) => (
            <div
              key={fav.favourite_id}
              className="fav-item-card"
              onClick={() => handleFavClick(fav)}
              title={`Go to ${fav.restaurant_name}`}
            >
              <span className="fav-item-icon">{FAV_EMOJIS[idx % FAV_EMOJIS.length]}</span>
              <div className="fav-item-info">
                <p className="fav-item-name">{fav.item_name}</p>
                <p className="fav-item-restaurant">📍 {fav.restaurant_name}</p>
              </div>
              <span className="fav-item-arrow">→</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

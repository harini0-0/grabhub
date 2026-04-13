import { useState } from "react";

const BASE_URL = "http://localhost:5050/api";

const REC_EMOJIS = ["🍕", "🌮", "🍜", "🍛", "🥗", "🍱", "🥘", "🍣", "🌯", "🍔"];

export default function Recommendations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/profile/1/recommendations`);
      const result = await res.json();
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">For You</h2>
        <p className="page-sub">Personalised picks based on your taste profile</p>
      </div>

      <div className="rec-cta">
        <button className="btn-primary" onClick={load} disabled={loading}
          style={{ minWidth: 200 }}>
          {loading ? "Finding picks…" : data ? "Refresh Picks" : "Get Recommendations"}
        </button>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          <span className="loading-text">Personalising your feed…</span>
        </div>
      )}

      {!loading && data && data.recommendations.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🤔</div>
          <p className="empty-state-text">No picks yet</p>
          <p className="empty-state-sub">Generate your taste profile first, then try again.</p>
        </div>
      )}

      {!loading && data && data.recommendations.length > 0 && (
        <div className="rec-grid">
          {data.recommendations.map((item, idx) => (
            <div key={item.item_id} className="rec-card">
              <div className="rec-card-emoji">
                {REC_EMOJIS[idx % REC_EMOJIS.length]}
              </div>
              <h4 className="rec-card-name">{item.item_name}</h4>
              {item.spice_level != null && (
                <>
                  <p className="rec-card-label">Spice level</p>
                  <div className="spice-bar">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`spice-dot${i <= item.spice_level ? " active" : ""}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

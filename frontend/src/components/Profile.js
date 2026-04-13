import { useState } from "react";

const BASE_URL = "http://localhost:5050/api";

const AXIS_EMOJI = { Spice: "🌶️", Cuisine: "🍴", Health: "🥗" };

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/profile/1`);
      const data = await res.json();
      setProfile(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <div className="profile-avatar">🧬</div>
        <h2 className="profile-card-title">Taste Profile</h2>
        <p className="profile-card-sub">
          We analyse your order history to classify your preferences across
          cuisine, spice, and health dimensions.
        </p>

        <button className="btn-primary full" onClick={generate} disabled={loading}>
          {loading ? "Analysing…" : "Generate My Profile"}
        </button>

        {profile && !profile.error && (
          <div className="profile-result">
            <div className="profile-result-row">
              <span className="profile-result-label">Preference Axis</span>
              <span className="profile-result-value">
                {AXIS_EMOJI[profile.axis] || "🎯"} {profile.axis}
              </span>
            </div>
            <div className="profile-result-row">
              <span className="profile-result-label">Category</span>
              <span className="profile-result-value">{profile.category}</span>
            </div>
          </div>
        )}

        {profile && profile.error && (
          <div className="profile-result" style={{ marginTop: 20 }}>
            <div className="profile-result-row">
              <span className="profile-result-label" style={{ color: "var(--danger)" }}>
                {profile.error}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

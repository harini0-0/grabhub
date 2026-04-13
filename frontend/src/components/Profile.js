import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5050/api";

// ── Preset persona captions ───────────────────────────────────────────────────

const PERSONAS = {
  "Spicy Enthusiast": {
    emoji: "🌶️",
    badge: "Heat Seeker",
    tagline: "You don't just eat — you conquer.",
    caption:
      "Bland food is your arch-enemy. You reach for the hot sauce before even tasting anything, and your spice tolerance is simultaneously a superpower and a mild public concern. 'Extra spicy' is just your baseline.",
  },
  "Health Conscious": {
    emoji: "🥗",
    badge: "Wellness Warrior",
    tagline: "Your body is a temple. A well-fuelled, macro-tracked temple.",
    caption:
      "You know the calorie count of everything on the menu without checking. You order grilled, not fried. You ask about gluten-free options unironically. You are that person — and honestly, we respect the discipline.",
  },
  "Balanced": {
    emoji: "⚖️",
    badge: "Equilibrium Expert",
    tagline: "The Goldilocks of dining — not too wild, not too safe.",
    caption:
      "You can go from a kale salad to loaded fries without missing a beat. You bring snacks to movie nights AND know when to order dessert. You've mastered the art of having it both ways, and it looks effortless.",
  },
  "Spice Lover": {
    emoji: "🔥",
    badge: "Flame Chaser",
    tagline: "Life's too short for mild.",
    caption:
      "Your palate doesn't just tolerate heat — it craves it. You've earned the respect of every kitchen you've walked into, and 'medium' makes you yawn.",
  },
  "Cuisine Explorer": {
    emoji: "🌍",
    badge: "Flavour Passport Holder",
    tagline: "Your taste buds have more stamps than your actual passport.",
    caption:
      "Every meal is a journey. You've probably ordered something you couldn't pronounce and loved every bite. Food is your window to the world, and you keep that window wide open.",
  },
};

const AXIS_FALLBACKS = {
  Spice: {
    emoji: "🌶️",
    badge: "Spice Enthusiast",
    tagline: "Heat is your love language.",
    caption:
      "You live on the hotter side of the menu and you wouldn't have it any other way. Food without spice is just... food.",
  },
  Health: {
    emoji: "🥦",
    badge: "Nutrition Nerd",
    tagline: "Eating well is your superpower.",
    caption:
      "You treat nutrition labels like a great novel — can't skip a line. Your meals are intentional, balanced, and quietly impressive.",
  },
  Cuisine: {
    emoji: "🍜",
    badge: "Culinary Explorer",
    tagline: "Every cuisine is a new adventure.",
    caption:
      "You eat your way through cultures and love every bite. The more unfamiliar the dish, the more intrigued you are.",
  },
};

const DEFAULT_PERSONA = {
  emoji: "🍴",
  badge: "Food Enthusiast",
  tagline: "You live to eat, and you eat well.",
  caption:
    "Every meal is an experience and you take it seriously. Whether it's comfort food or culinary adventure, you show up fully.",
};

function getPersona(profile) {
  if (!profile || profile.error) return null;
  return PERSONAS[profile.category] || AXIS_FALLBACKS[profile.axis] || DEFAULT_PERSONA;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(first = "", last = "") {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Profile({ customerId }) {
  const [customer, setCustomer] = useState(null);
  const [profile, setProfile]   = useState(null);
  const [generating, setGenerating] = useState(false);

  // Reload customer info and reset taste profile whenever the active customer changes
  useEffect(() => {
    setCustomer(null);
    setProfile(null);
    fetch(`${BASE_URL}/customers/${customerId}`)
      .then(r => r.json())
      .then(setCustomer)
      .catch(() => {});
  }, [customerId]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res  = await fetch(`${BASE_URL}/profile/${customerId}`);
      const data = await res.json();
      setProfile(data);
    } finally {
      setGenerating(false);
    }
  };

  const persona = getPersona(profile);

  return (
    <div className="profile-page">

      {/* ── Customer Info Card ─────────────────────── */}
      <div className="info-card">
        <div className="info-card-header">
          <div className="info-avatar">
            {customer ? initials(customer.first_name, customer.last_name) : "?"}
          </div>
          <div className="info-header-text">
            {customer
              ? <p className="info-full-name">{customer.first_name} {customer.last_name}</p>
              : <p className="info-full-name" style={{ color: "var(--text-muted)" }}>Loading…</p>
            }
            <p className="info-section-label">Customer Account</p>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-field">
            <p className="info-field-label">Email</p>
            <p className="info-field-value">{customer?.email ?? "—"}</p>
          </div>
          <div className="info-field">
            <p className="info-field-label">Phone</p>
            <p className="info-field-value">{customer?.phone ?? "—"}</p>
          </div>
          <div className="info-field">
            <p className="info-field-label">Member Since</p>
            <p className="info-field-value">{formatDate(customer?.registration_date)}</p>
          </div>
          <div className="info-field">
            <p className="info-field-label">Customer ID</p>
            <p className="info-field-value">#{customer?.customer_id ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* ── Taste Profile Card ─────────────────────── */}
      <div className="persona-card">
        <div className="persona-card-header">
          <div className="profile-avatar" style={{ margin: 0, width: 44, height: 44, fontSize: 20 }}>
            🧬
          </div>
          <div>
            <p className="persona-card-title">Taste Profile</p>
            <p className="persona-card-subtitle">Powered by order history</p>
          </div>
        </div>

        <button
          className="btn-primary full"
          onClick={generate}
          disabled={generating}
          style={{ marginBottom: (persona || profile?.error) ? 20 : 0 }}
        >
          {generating ? "Analysing…" : profile ? "Regenerate Profile" : "Generate My Profile"}
        </button>

        {profile?.error && (
          <div style={{
            background: "var(--danger-light)", color: "var(--danger)",
            borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13,
          }}>
            {profile.error}
          </div>
        )}

        {persona && (
          <div className="persona-result">
            <div className="persona-emoji-large">{persona.emoji}</div>
            <div className="persona-badge">{persona.badge}</div>
            <p className="persona-tagline">{persona.tagline}</p>
            <p className="persona-caption">{persona.caption}</p>
            <div className="persona-meta">
              <span className="persona-meta-pill"><strong>Axis</strong>&nbsp; {profile.axis}</span>
              <span className="persona-meta-pill"><strong>Category</strong>&nbsp; {profile.category}</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

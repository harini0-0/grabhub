import { useState } from "react";
import RestaurantList from "./RestaurantList";
import Profile from "./Profile";
import Recommendations from "./Recommendations";
import Orders from "./Orders";
import Addresses from "./Addresses";
import Subscriptions from "./Subscriptions";
import Billing from "./Billing";

export default function CustomerDashboard() {
  const [view, setView] = useState("restaurants");

  return (
    <div>
      <nav className="navbar">
        <span className="navbar-brand">Grab<span>Hub</span></span>
        <div className="navbar-tabs">
          {/* Harini's tabs (unchanged) */}
          <button
            className={`navbar-tab ${view === "restaurants" ? "active" : ""}`}
            onClick={() => setView("restaurants")}
          >
            🍴 Restaurants
          </button>
          <button
            className={`navbar-tab ${view === "profile" ? "active" : ""}`}
            onClick={() => setView("profile")}
          >
            🧬 My Profile
          </button>
          <button
            className={`navbar-tab ${view === "recommendations" ? "active" : ""}`}
            onClick={() => setView("recommendations")}
          >
            ✨ For You
          </button>

          {/* Mithuna's tabs (added) */}
          <button
            className={`navbar-tab ${view === "orders" ? "active" : ""}`}
            onClick={() => setView("orders")}
          >
            📦 Orders
          </button>
          <button
            className={`navbar-tab ${view === "addresses" ? "active" : ""}`}
            onClick={() => setView("addresses")}
          >
            📍 Addresses
          </button>
          <button
            className={`navbar-tab ${view === "subscriptions" ? "active" : ""}`}
            onClick={() => setView("subscriptions")}
          >
            ⭐ GrabHub+
          </button>
          <button
            className={`navbar-tab ${view === "billing" ? "active" : ""}`}
            onClick={() => setView("billing")}
          >
            💳 Billing
          </button>
        </div>
      </nav>

      <main className="page">
        {/* Harini's views (unchanged) */}
        {view === "restaurants"     && <RestaurantList />}
        {view === "profile"         && <Profile />}
        {view === "recommendations" && <Recommendations />}

        {/* Mithuna's views (added) */}
        {view === "orders"          && <Orders />}
        {view === "addresses"       && <Addresses />}
        {view === "subscriptions"   && <Subscriptions />}
        {view === "billing"         && <Billing />}
      </main>
    </div>
  );
}

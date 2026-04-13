import { useState } from "react";
import RestaurantList from "./RestaurantList";
import Profile from "./Profile";
import Recommendations from "./Recommendations";

export default function CustomerDashboard() {
  const [view, setView] = useState("restaurants");

  return (
    <div>
      <nav className="navbar">
        <span className="navbar-brand">Grab<span>Hub</span></span>
        <div className="navbar-tabs">
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
        </div>
      </nav>

      <main className="page">
        {view === "restaurants"     && <RestaurantList />}
        {view === "profile"         && <Profile />}
        {view === "recommendations" && <Recommendations />}
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";
import RestaurantList from "./RestaurantList";
import Profile from "./Profile";
import Recommendations from "./Recommendations";
import OrderHistory from "./OrderHistory";

const BASE_URL = "http://localhost:5050/api";

export default function CustomerDashboard() {
  const [view, setView] = useState("restaurants");
  const [directRestaurant, setDirectRestaurant] = useState(null);

  // Customer switcher state
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState(1);

  // Load customer list once on mount
  useEffect(() => {
    fetch(`${BASE_URL}/customers`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setCustomers(data);
      })
      .catch(() => {});
  }, []);

  const goToRestaurant = (restaurant) => {
    setDirectRestaurant(restaurant);
    setView("restaurants");
  };

  const handleTabClick = (tab) => {
    if (tab !== "restaurants") setDirectRestaurant(null);
    setView(tab);
  };

  const handleCustomerChange = (e) => {
    setCustomerId(Number(e.target.value));
    // Reset direct-nav so switching customer on Restaurants tab
    // doesn't keep a stale restaurant open
    setDirectRestaurant(null);
  };

  return (
    <div>
      <nav className="navbar">
        <span className="navbar-brand">Grab<span>Hub</span></span>

        <div className="navbar-tabs">
          <button
            className={`navbar-tab ${view === "restaurants" ? "active" : ""}`}
            onClick={() => handleTabClick("restaurants")}
          >
            🍴 Restaurants
          </button>
          <button
            className={`navbar-tab ${view === "profile" ? "active" : ""}`}
            onClick={() => handleTabClick("profile")}
          >
            🧬 My Profile
          </button>
          <button
            className={`navbar-tab ${view === "recommendations" ? "active" : ""}`}
            onClick={() => handleTabClick("recommendations")}
          >
            ✨ For You
          </button>
          <button
            className={`navbar-tab ${view === "orders" ? "active" : ""}`}
            onClick={() => handleTabClick("orders")}
          >
            📦 Orders
          </button>
        </div>

        {/* Customer switcher — only shown when customer list has loaded */}
        {customers.length > 0 && (
          <div className="navbar-switcher">
            <span className="navbar-switcher-label">Viewing as</span>
            <select
              className="navbar-switcher-select"
              value={customerId}
              onChange={handleCustomerChange}
            >
              {customers.map(c => (
                <option key={c.customer_id} value={c.customer_id}>
                  {c.first_name} {c.last_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </nav>

      <main className="page">
        {view === "restaurants" && (
          <RestaurantList
            customerId={customerId}
            initialRestaurant={directRestaurant}
            onClearInitial={() => setDirectRestaurant(null)}
          />
        )}
        {view === "profile" && (
          <Profile customerId={customerId} />
        )}
        {view === "recommendations" && (
          <Recommendations customerId={customerId} goToRestaurant={goToRestaurant} />
        )}
        {view === "orders" && (
          <OrderHistory customerId={customerId} />
        )}
      </main>
    </div>
  );
}

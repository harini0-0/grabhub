import { useState } from "react";
import RestaurantList from "./RestaurantList";
import Profile from "./Profile";
import Recommendations from "./Recommendations";
import Orders from "./Orders";
import Addresses from "./Addresses";
import Subscriptions from "./Subscriptions";
import Billing from "./Billing";

export default function CustomerDashboard({ customerId, customer, onLogout }) {
  const [view, setView] = useState("restaurants");
  const [directRestaurant, setDirectRestaurant] = useState(null);

  const goToRestaurant = (restaurant) => {
    setDirectRestaurant(restaurant);
    setView("restaurants");
  };

  const handleTabClick = (tab) => {
    if (tab !== "restaurants") setDirectRestaurant(null);
    setView(tab);
  };

  return (
    <div>
      <nav className="navbar">
        <span className="navbar-brand">Grab<span>Hub</span></span>

        <div className="navbar-tabs">
          <button className={`navbar-tab ${view === "restaurants"    ? "active" : ""}`} onClick={() => handleTabClick("restaurants")}>Restaurants</button>
          <button className={`navbar-tab ${view === "profile"        ? "active" : ""}`} onClick={() => handleTabClick("profile")}>My Profile</button>
          <button className={`navbar-tab ${view === "recommendations" ? "active" : ""}`} onClick={() => handleTabClick("recommendations")}>For You</button>
          <button className={`navbar-tab ${view === "orders"         ? "active" : ""}`} onClick={() => handleTabClick("orders")}>Orders</button>
          <button className={`navbar-tab ${view === "addresses"      ? "active" : ""}`} onClick={() => handleTabClick("addresses")}>Addresses</button>
          <button className={`navbar-tab ${view === "subscriptions"  ? "active" : ""}`} onClick={() => handleTabClick("subscriptions")}>GrabHub+</button>
          <button className={`navbar-tab ${view === "billing"        ? "active" : ""}`} onClick={() => handleTabClick("billing")}>Billing</button>
        </div>

        <div className="navbar-user">
          <span className="navbar-user-name">
            {customer?.first_name} {customer?.last_name}
          </span>
          <button className="navbar-logout-btn" onClick={onLogout}>Sign Out</button>
        </div>
      </nav>

      <main className="page">
        {view === "restaurants" && (
          <RestaurantList
            customerId={customerId}
            initialRestaurant={directRestaurant}
            onClearInitial={() => setDirectRestaurant(null)}
          />
        )}
        {view === "profile"         && <Profile         customerId={customerId} />}
        {view === "recommendations" && <Recommendations customerId={customerId} goToRestaurant={goToRestaurant} />}
        {view === "orders"          && <Orders          customerId={customerId} />}
        {view === "addresses"       && <Addresses       customerId={customerId} />}
        {view === "subscriptions"   && <Subscriptions   customerId={customerId} />}
        {view === "billing"         && <Billing         customerId={customerId} />}
      </main>
    </div>
  );
}

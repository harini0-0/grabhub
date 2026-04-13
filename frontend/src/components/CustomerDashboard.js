import { useState } from "react";
import RestaurantList from "./RestaurantList";
import Profile from "./Profile";
import Recommendations from "./Recommendations";

export default function CustomerDashboard() {
  const [view, setView] = useState("restaurants");

  return (
    <div>
      <h1>Customer Dashboard</h1>

      <button onClick={() => setView("restaurants")}>Restaurants</button>
      <button onClick={() => setView("profile")}>Profile</button>
      <button onClick={() => setView("recommendations")}>Recommendations</button>

      {view === "restaurants" && <RestaurantList />}
      {view === "profile" && <Profile />}
      {view === "recommendations" && <Recommendations />}
    </div>
  );
}
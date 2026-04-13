import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import CustomerDashboard from "./components/CustomerDashboard";
import DeliveryDashboard from "./components/DeliveryDashboard";
import RestaurantAdmin from "./components/RestaurantAdmin";

function App() {
  const [role, setRole] = useState(null);

  if (!role) return <LandingPage setRole={setRole} />;
  if (role === "customer")  return <CustomerDashboard />;
  if (role === "delivery")  return <DeliveryDashboard />;
  if (role === "admin")     return <RestaurantAdmin />;

  return null;
}

export default App;

import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import CustomerDashboard from "./components/CustomerDashboard";
import DeliveryDashboard from "./components/DeliveryDashboard";

function App() {
  const [role, setRole] = useState(null);

  if (!role) return <LandingPage setRole={setRole} />;

  if (role === "customer") return <CustomerDashboard />;
  if (role === "delivery") return <DeliveryDashboard />;

  return null;
}

export default App;
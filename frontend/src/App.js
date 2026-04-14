import React, { useState } from "react";
import LandingPage from "./components/LandingPage";
import CustomerAuth from "./components/CustomerAuth";
import CustomerDashboard from "./components/CustomerDashboard";
import DeliveryDashboard from "./components/DeliveryDashboard";
import RestaurantAdmin from "./components/RestaurantAdmin";

function App() {
  const [role, setRole]         = useState(null);
  const [customer, setCustomer] = useState(null); // { customer_id, first_name, last_name, ... }

  const handleLogin  = (data) => setCustomer(data);
  const handleLogout = () => { setCustomer(null); setRole(null); };

  if (!role) return <LandingPage setRole={setRole} />;

  if (role === "customer") {
    if (!customer) return <CustomerAuth onLogin={handleLogin} onBack={() => setRole(null)} />;
    return <CustomerDashboard customerId={customer.customer_id} customer={customer} onLogout={handleLogout} />;
  }

  if (role === "delivery") return <DeliveryDashboard onBack={() => setRole(null)} />;
  if (role === "admin")    return <RestaurantAdmin />;

  return null;
}

export default App;

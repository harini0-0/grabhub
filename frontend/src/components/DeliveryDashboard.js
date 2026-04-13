import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5050/api";

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/delivery/orders`) // you will create this API
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  return (
    <div>
      <h1>🚴 Delivery Dashboard</h1>

      {orders.map(order => (
        <div key={order.order_id}>
          <p>Order #{order.order_id}</p>
          <p>Status: {order.status}</p>
        </div>
      ))}
    </div>
  );
}
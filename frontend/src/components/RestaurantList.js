import { useEffect, useState } from "react";
import MenuView from "./MenuView";

const BASE_URL = "http://localhost:5050/api";

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/restaurants`)
      .then(res => res.json())
      .then(data => setRestaurants(data));
  }, []);

  if (selected) {
    return <MenuView restaurant={selected} goBack={() => setSelected(null)} />;
  }

  return (
    <div>
      <h2>Restaurants</h2>

      {restaurants.map(r => (
        <div key={r.restaurant_id} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
          <h3>{r.restaurant_name}</h3>
          <p>{r.city}, {r.state}</p>
          <p>⭐ {r.average_rating}</p>

          <button onClick={() => setSelected(r)}>View Menu</button>
        </div>
      ))}
    </div>
  );
}
import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5050/api";

export default function MenuView({ restaurant, goBack }) {
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}/restaurants/${restaurant.restaurant_id}/menu`)
      .then(res => res.json())
      .then(data => setMenu(data));
  }, [restaurant]);

  return (
    <div>
      <button onClick={goBack}>⬅ Back</button>

      <h2>{restaurant.restaurant_name} Menu</h2>

      {menu.map(item => (
        <div key={item.item_id}>
          <p>{item.item_name} - ${item.price}</p>
        </div>
      ))}
    </div>
  );
}
import { useState } from "react";

const BASE_URL = "http://localhost:5050/api";

export default function Recommendations() {
  const [data, setData] = useState(null);

  const load = async () => {
    const res = await fetch(`${BASE_URL}/profile/1/recommendations`);
    const result = await res.json();
    setData(result);
  };

  return (
    <div>
      <h2>Recommendations</h2>
      <button onClick={load}>Get Recommendations</button>

      {data && data.recommendations.map(item => (
        <div key={item.item_id}>
          <p>{item.item_name} - Spice: {item.spice_level}</p>
        </div>
      ))}
    </div>
  );
}
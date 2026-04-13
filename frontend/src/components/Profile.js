import { useState } from "react";

const BASE_URL = "http://localhost:5050/api";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  const generate = async () => {
    const res = await fetch(`${BASE_URL}/profile/1`);
    const data = await res.json();
    setProfile(data);
  };

  return (
    <div>
      <h2>Customer Profile</h2>
      <button onClick={generate}>Generate Profile</button>

      {profile && (
        <div>
          <p>Axis: {profile.axis}</p>
          <p>Category: {profile.category}</p>
        </div>
      )}
    </div>
  );
}
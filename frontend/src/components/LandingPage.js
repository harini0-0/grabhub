export default function LandingPage({ setRole }) {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>🍔 GrabHub</h1>
      <h2>Select Role</h2>

      <button onClick={() => setRole("customer")}>
        👤 Customer
      </button>

      <button onClick={() => setRole("delivery")}>
        🚴 Delivery Partner
      </button>
    </div>
  );
}
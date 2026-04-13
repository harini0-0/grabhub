import { useState, useEffect } from "react";

const API = "http://localhost:5050/api";

export default function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [message, setMessage] = useState("");

  const customerId = 1;

  useEffect(() => { fetchAddresses(); }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch(`${API}/addresses/customer/${customerId}`);
      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error(err);
      setAddresses([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const body = {
      customer_id: customerId,
      street_number: form.street_number.value,
      street_name: form.street_name.value,
      apt_unit: form.apt_unit.value || null,
      city: form.city.value,
      state: form.state.value,
      zipcode: form.zipcode.value,
      address_type: form.address_type.value,
      delivery_instructions: form.delivery_instructions.value || null,
      is_default: form.is_default.checked
    };

    try {
      let res;
      if (editingAddress) {
        res = await fetch(`${API}/addresses/${editingAddress.address_id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
        });
      } else {
        res = await fetch(`${API}/addresses`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
        });
      }
      const data = await res.json();
      setMessage(data.message);
      setShowForm(false);
      setEditingAddress(null);
      fetchAddresses();
    } catch (err) { setMessage("Failed to save address"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await fetch(`${API}/addresses/${id}`, { method: "DELETE" });
      setMessage("Address deleted");
      fetchAddresses();
    } catch (err) { setMessage("Delete failed"); }
  };

  const startEdit = (addr) => {
    setEditingAddress(addr);
    setShowForm(true);
  };

  if (showForm) {
    const a = editingAddress || {};
    return (
      <div style={{ padding: "1rem" }}>
        <button onClick={() => { setShowForm(false); setEditingAddress(null); }} style={btnStyle}>← Back</button>
        <h2>{editingAddress ? "Edit Address" : "Add Address"}</h2>
        <form onSubmit={handleSubmit} style={cardStyle}>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={fieldStyle}><label>Street Number</label><input name="street_number" defaultValue={a.street_number || ""} required style={inputStyle} /></div>
            <div style={fieldStyle}><label>Street Name</label><input name="street_name" defaultValue={a.street_name || ""} required style={inputStyle} /></div>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={fieldStyle}><label>Apt/Unit</label><input name="apt_unit" defaultValue={a.apt_unit || ""} style={inputStyle} /></div>
            <div style={fieldStyle}>
              <label>Type</label>
              <select name="address_type" defaultValue={a.address_type || "Home"} style={inputStyle}>
                <option value="Home">Home</option><option value="Work">Work</option><option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={fieldStyle}><label>City</label><input name="city" defaultValue={a.city || ""} required style={inputStyle} /></div>
            <div style={fieldStyle}><label>State</label><input name="state" defaultValue={a.state || ""} maxLength="2" required style={inputStyle} /></div>
            <div style={fieldStyle}><label>Zipcode</label><input name="zipcode" defaultValue={a.zipcode || ""} maxLength="5" required style={inputStyle} /></div>
          </div>
          <div style={fieldStyle}><label>Delivery Instructions</label><textarea name="delivery_instructions" defaultValue={a.delivery_instructions || ""} style={inputStyle} /></div>
          <div style={{ marginBottom: "1rem" }}>
            <label><input type="checkbox" name="is_default" defaultChecked={a.is_default || false} /> Set as default</label>
          </div>
          <button type="submit" style={{ ...btnStyle, background: "#e44d26", color: "#fff" }}>Save</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>My Addresses</h2>
        <button onClick={() => setShowForm(true)} style={{ ...btnStyle, background: "#e44d26", color: "#fff" }}>+ Add Address</button>
      </div>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {addresses.length === 0 ? <p>No saved addresses.</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
          {addresses.map((a) => (
            <div key={a.address_id} style={cardStyle}>
              <strong>{a.address_type} {a.is_default ? "(Default)" : ""}</strong>
              <p>{a.street_number} {a.street_name}{a.apt_unit ? `, ${a.apt_unit}` : ""}</p>
              <p>{a.city}, {a.state} {a.zipcode}</p>
              {a.delivery_instructions && <p style={{ color: "#888", fontSize: "0.85rem" }}>Note: {a.delivery_instructions}</p>}
              <div style={{ marginTop: "0.5rem" }}>
                <button onClick={() => startEdit(a)} style={btnSmStyle}>Edit</button>
                <button onClick={() => handleDelete(a.address_id)} style={{ ...btnSmStyle, background: "#dc3545", marginLeft: "0.3rem" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const cardStyle = { background: "#fff", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" };
const btnStyle = { padding: "0.5rem 1rem", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", background: "#eee" };
const btnSmStyle = { padding: "0.3rem 0.6rem", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem", background: "#6c757d", color: "#fff" };
const fieldStyle = { marginBottom: "0.75rem", flex: 1 };
const inputStyle = { width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "6px", fontSize: "0.9rem" };

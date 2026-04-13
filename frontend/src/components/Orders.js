import { useState, useEffect } from "react";

const API = "http://localhost:5050/api";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPlaceOrder, setShowPlaceOrder] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [message, setMessage] = useState("");

  const customerId = 1;

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/orders/customer/${customerId}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      const res = await fetch(`${API}/orders/${orderId}`);
      const data = await res.json();
      setSelectedOrder(data);
    } catch (err) {
      console.error("Error fetching order detail:", err);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order? You will receive a full refund.")) return;
    try {
      const res = await fetch(`${API}/orders/${orderId}/cancel`, { method: "PUT" });
      const data = await res.json();
      setMessage(data.message);
      fetchOrders();
      if (selectedOrder) fetchOrderDetail(orderId);
    } catch (err) {
      setMessage("Cancellation failed");
    }
  };

  const openPlaceOrder = async () => {
    try {
      const [restRes, addrRes] = await Promise.all([
        fetch(`${API}/restaurants`),
        fetch(`${API}/addresses/customer/${customerId}`)
      ]);
      const restData = await restRes.json();
      const addrData = await addrRes.json();
      setRestaurants(Array.isArray(restData) ? restData : []);
      setAddresses(Array.isArray(addrData) ? addrData : []);
      setShowPlaceOrder(true);
    } catch (err) {
      console.error("Error loading form data:", err);
    }
  };

  const fetchMenu = async (restaurantId) => {
    try {
      const res = await fetch(`${API}/restaurants/${restaurantId}/menu`);
      const data = await res.json();
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching menu:", err);
      setMenuItems([]);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    const form = e.target;
    const selectedItems = [];
    const qtyInputs = form.querySelectorAll(".item-qty");
    qtyInputs.forEach((input) => {
      const qty = parseInt(input.value);
      if (qty > 0) {
        selectedItems.push({
          menu_item_id: parseInt(input.dataset.id),
          quantity: qty,
          unit_price: parseFloat(input.dataset.price)
        });
      }
    });

    if (selectedItems.length === 0) {
      alert("Please select at least one item.");
      return;
    }

    const body = {
      customer_id: customerId,
      restaurant_id: parseInt(form.restaurant_id.value),
      address_id: parseInt(form.address_id.value),
      order_type: form.order_type.value,
      scheduled_time: form.scheduled_date?.value && form.scheduled_time?.value
        ? `${form.scheduled_date.value} ${form.scheduled_time.value}:00` : null,
      party_size: form.party_size?.value ? parseInt(form.party_size.value) : null,
      special_instructions: form.special_instructions.value || null,
      items: selectedItems,
      delivery_fee: parseFloat(form.delivery_fee.value) || 0,
      tip: parseFloat(form.tip.value) || 0,
      payment_method: form.payment_method.value,
      card_last_four: form.card_last_four.value || null
    };

    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Order #${data.order_id} placed!`);
        setShowPlaceOrder(false);
        fetchOrders();
      } else {
        setMessage(data.message || "Failed to place order");
      }
    } catch (err) {
      setMessage("Failed to place order");
    }
  };

  const getBadgeClass = (status) => {
    const map = {
      Scheduled: "#fff3cd", Confirmed: "#cce5ff", Preparing: "#d4edda",
      "Out for Delivery": "#d1ecf1", Delivered: "#d4edda", Cancelled: "#f8d7da"
    };
    return map[status] || "#e2e3e5";
  };

  // --- ORDER DETAIL VIEW ---
  if (selectedOrder) {
    const { order, items, billing } = selectedOrder;
    const itemsList = Array.isArray(items) ? items : [];
    return (
      <div style={{ padding: "1rem" }}>
        <button onClick={() => setSelectedOrder(null)} style={btnStyle}>← Back</button>
        <h2>Order #{order.order_id}</h2>
        {message && <p style={{ color: "green" }}>{message}</p>}
        <div style={cardStyle}>
          <p><strong>Restaurant:</strong> {order.restaurant_name}</p>
          <p><strong>Type:</strong> {order.order_type}</p>
          <p><strong>Status:</strong>{" "}
            <span style={{ ...badgeStyle, background: getBadgeClass(order.status) }}>{order.status}</span>
          </p>
          {order.scheduled_time && <p><strong>Scheduled:</strong> {new Date(order.scheduled_time).toLocaleString()}</p>}
          {order.party_size && <p><strong>Party Size:</strong> {order.party_size}</p>}
        </div>
        <h3>Items</h3>
        <table style={tableStyle}>
          <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
          <tbody>
            {itemsList.map((i, idx) => (
              <tr key={idx}>
                <td>{i.item_name}</td><td>{i.quantity}</td>
                <td>${Number(i.unit_price).toFixed(2)}</td>
                <td>${(i.quantity * i.unit_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={cardStyle}>
          <p><strong>Subtotal:</strong> ${Number(order.subtotal).toFixed(2)}</p>
          <p><strong>Delivery:</strong> ${Number(order.delivery_fee).toFixed(2)}</p>
          <p><strong>Tax:</strong> ${Number(order.tax).toFixed(2)}</p>
          <p><strong>Tip:</strong> ${Number(order.tip).toFixed(2)}</p>
          <p><strong>Total:</strong> ${Number(order.total_amount).toFixed(2)}</p>
          {billing && <p><strong>Payment:</strong> {billing.payment_method} — {billing.payment_status}</p>}
        </div>
        {(order.status === "Scheduled" || order.status === "Confirmed") && (
          <button onClick={() => handleCancel(order.order_id)} style={{ ...btnStyle, background: "#dc3545", color: "#fff" }}>
            Cancel Order
          </button>
        )}
      </div>
    );
  }

  // --- PLACE ORDER FORM ---
  if (showPlaceOrder) {
    return (
      <div style={{ padding: "1rem" }}>
        <button onClick={() => setShowPlaceOrder(false)} style={btnStyle}>← Back</button>
        <h2>Place Order</h2>
        <form onSubmit={handlePlaceOrder} style={cardStyle}>
          <div style={fieldStyle}>
            <label>Restaurant</label>
            <select name="restaurant_id" required onChange={(e) => fetchMenu(e.target.value)} style={inputStyle}>
              <option value="">— Select —</option>
              {restaurants.map((r) => <option key={r.restaurant_id} value={r.restaurant_id}>{r.restaurant_name}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label>Delivery Address</label>
            <select name="address_id" required style={inputStyle}>
              {addresses.length === 0 ? <option value="">No addresses saved</option> :
                addresses.map((a) => (
                  <option key={a.address_id} value={a.address_id}>
                    {a.address_type}: {a.street_number} {a.street_name}, {a.city}
                  </option>
                ))
              }
            </select>
          </div>
          <div style={fieldStyle}>
            <label>Order Type</label>
            <select name="order_type" required style={inputStyle}>
              <option value="On-Demand">On-Demand</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Party">Party</option>
            </select>
          </div>
          <div style={fieldStyle}>
            <label>Scheduled Date</label>
            <input type="date" name="scheduled_date" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label>Scheduled Time</label>
            <input type="time" name="scheduled_time" style={inputStyle} />
          </div>
          <div style={fieldStyle}>
            <label>Party Size</label>
            <input type="number" name="party_size" min="2" style={inputStyle} />
          </div>

          {menuItems.length > 0 && (
            <div style={fieldStyle}>
              <label><strong>Menu Items</strong></label>
              {menuItems.map((mi) => (
                <div key={mi.item_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.3rem 0" }}>
                  <span>{mi.item_name} — ${Number(mi.price).toFixed(2)}</span>
                  <input type="number" min="0" defaultValue="0" className="item-qty"
                    data-id={mi.item_id} data-price={mi.price} style={{ width: "60px" }} />
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={fieldStyle}>
              <label>Delivery Fee ($)</label>
              <input type="number" name="delivery_fee" defaultValue="3.99" step="0.01" style={inputStyle} />
            </div>
            <div style={fieldStyle}>
              <label>Tip ($)</label>
              <input type="number" name="tip" defaultValue="0" step="0.50" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div style={fieldStyle}>
              <label>Payment Method</label>
              <select name="payment_method" required style={inputStyle}>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="PayPal">PayPal</option>
                <option value="Apple Pay">Apple Pay</option>
                <option value="Google Pay">Google Pay</option>
              </select>
            </div>
            <div style={fieldStyle}>
              <label>Card Last 4</label>
              <input type="text" name="card_last_four" maxLength="4" style={inputStyle} />
            </div>
          </div>
          <div style={fieldStyle}>
            <label>Special Instructions</label>
            <textarea name="special_instructions" style={inputStyle} />
          </div>
          <button type="submit" style={{ ...btnStyle, background: "#e44d26", color: "#fff" }}>Place Order</button>
        </form>
      </div>
    );
  }

  // --- ORDER LIST ---
  return (
    <div style={{ padding: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>My Orders</h2>
        <button onClick={openPlaceOrder} style={{ ...btnStyle, background: "#e44d26", color: "#fff" }}>+ Place Order</button>
      </div>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {orders.length === 0 ? <p>No orders yet.</p> : (
        <table style={tableStyle}>
          <thead>
            <tr><th>Order #</th><th>Restaurant</th><th>Type</th><th>Status</th><th>Total</th><th>Date</th><th></th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.order_id}>
                <td>{o.order_id}</td>
                <td>{o.restaurant_name}</td>
                <td>{o.order_type}</td>
                <td><span style={{ ...badgeStyle, background: getBadgeClass(o.status) }}>{o.status}</span></td>
                <td>${Number(o.total_amount).toFixed(2)}</td>
                <td>{new Date(o.order_placed_at).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => fetchOrderDetail(o.order_id)} style={btnSmStyle}>Details</button>
                  {(o.status === "Scheduled" || o.status === "Confirmed") && (
                    <button onClick={() => handleCancel(o.order_id)} style={{ ...btnSmStyle, background: "#dc3545", color: "#fff", marginLeft: "0.3rem" }}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const cardStyle = { background: "#fff", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" };
const tableStyle = { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" };
const badgeStyle = { padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "600" };
const btnStyle = { padding: "0.5rem 1rem", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", background: "#eee" };
const btnSmStyle = { padding: "0.3rem 0.6rem", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem", background: "#e44d26", color: "#fff" };
const fieldStyle = { marginBottom: "0.75rem" };
const inputStyle = { width: "100%", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "6px", fontSize: "0.9rem" };

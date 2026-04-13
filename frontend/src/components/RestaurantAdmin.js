import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5050/api";

const CATEGORIES = ["Appetizer", "Main Course", "Dessert", "Beverage", "Side"];

const EMPTY_FORM = {
  item_name: "",
  description: "",
  category: "Main Course",
  price: "",
  preparation_time: 15,
  spice_level: 0,
  calories: "",
  is_vegetarian: false,
  is_vegan: false,
  is_gluten_free: false,
  is_available: true,
};

// ── Item Form (shared for Add and Edit) ──────────────────────────────────────

function ItemForm({ initial, restaurantId, onSaved, onCancel }) {
  const isEdit = !!initial?.item_id;
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const save = async () => {
    if (!form.item_name.trim()) return setMsg({ type: "error", text: "Item name is required." });
    if (!form.price || isNaN(form.price)) return setMsg({ type: "error", text: "A valid price is required." });

    setSaving(true);
    setMsg(null);
    try {
      const url = isEdit
        ? `${BASE_URL}/restaurants/${restaurantId}/menu/${form.item_id}`
        : `${BASE_URL}/restaurants/${restaurantId}/menu`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          calories: form.calories ? parseInt(form.calories) : null,
          spice_level: parseInt(form.spice_level) || 0,
          preparation_time: parseInt(form.preparation_time) || 15,
          is_vegetarian: form.is_vegetarian ? 1 : 0,
          is_vegan: form.is_vegan ? 1 : 0,
          is_gluten_free: form.is_gluten_free ? 1 : 0,
          is_available: form.is_available ? 1 : 0,
        })
      });

      if (res.ok) {
        onSaved();
      } else {
        const data = await res.json();
        setMsg({ type: "error", text: data.message || "Save failed." });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-form-card">
      <p className="admin-form-title">{isEdit ? `Edit: ${initial.item_name}` : "Add New Menu Item"}</p>

      {msg && <div className={`admin-form-msg ${msg.type}`}>{msg.text}</div>}

      <div className="admin-form-grid">
        <div className="admin-form-field full-width">
          <label className="admin-form-label">Item Name *</label>
          <input className="admin-form-input" value={form.item_name}
            onChange={e => set("item_name", e.target.value)} placeholder="e.g. Margherita Pizza" />
        </div>

        <div className="admin-form-field">
          <label className="admin-form-label">Category</label>
          <select className="admin-form-select" value={form.category}
            onChange={e => set("category", e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="admin-form-field">
          <label className="admin-form-label">Price ($) *</label>
          <input className="admin-form-input" type="number" min="0" step="0.01"
            value={form.price} onChange={e => set("price", e.target.value)} placeholder="0.00" />
        </div>

        <div className="admin-form-field">
          <label className="admin-form-label">Prep Time (min)</label>
          <input className="admin-form-input" type="number" min="1"
            value={form.preparation_time} onChange={e => set("preparation_time", e.target.value)} />
        </div>

        <div className="admin-form-field">
          <label className="admin-form-label">Spice Level (0–5)</label>
          <input className="admin-form-input" type="number" min="0" max="5"
            value={form.spice_level} onChange={e => set("spice_level", e.target.value)} />
        </div>

        <div className="admin-form-field">
          <label className="admin-form-label">Calories (optional)</label>
          <input className="admin-form-input" type="number" min="0"
            value={form.calories} onChange={e => set("calories", e.target.value)} placeholder="e.g. 450" />
        </div>

        <div className="admin-form-field full-width">
          <label className="admin-form-label">Description (optional)</label>
          <textarea className="admin-form-textarea" value={form.description}
            onChange={e => set("description", e.target.value)} placeholder="Short description of the item…" />
        </div>
      </div>

      <div className="admin-form-checkboxes" style={{ marginBottom: 16 }}>
        {[
          ["is_vegetarian", "🥦 Vegetarian"],
          ["is_vegan",      "🌱 Vegan"],
          ["is_gluten_free","🌾 Gluten-Free"],
          ["is_available",  "✅ Available"],
        ].map(([key, label]) => (
          <label key={key} className="admin-checkbox-label">
            <input type="checkbox" checked={!!form[key]}
              onChange={e => set(key, e.target.checked)} />
            {label}
          </label>
        ))}
      </div>

      <div className="admin-form-actions">
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Item"}
        </button>
      </div>
    </div>
  );
}

// ── Main RestaurantAdmin ──────────────────────────────────────────────────────

export default function RestaurantAdmin() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [menu, setMenu] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [mode, setMode] = useState(null); // null | "add" | { item } for edit
  const [deleteConfirm, setDeleteConfirm] = useState(null); // item_id to confirm
  const [flashMsg, setFlashMsg] = useState(null);

  // Load restaurant list
  useEffect(() => {
    fetch(`${BASE_URL}/restaurants`)
      .then(r => r.json())
      .then(data => {
        setRestaurants(data);
        if (data.length > 0) setSelectedId(String(data[0].restaurant_id));
      });
  }, []);

  // Load menu when restaurant changes
  useEffect(() => {
    if (!selectedId) return;
    setMenuLoading(true);
    setMode(null);
    fetch(`${BASE_URL}/restaurants/${selectedId}/menu`)
      .then(r => r.json())
      .then(data => { setMenu(data); setMenuLoading(false); })
      .catch(() => setMenuLoading(false));
  }, [selectedId]);

  const reloadMenu = () => {
    setMenuLoading(true);
    fetch(`${BASE_URL}/restaurants/${selectedId}/menu`)
      .then(r => r.json())
      .then(data => { setMenu(data); setMenuLoading(false); });
  };

  const handleSaved = (action) => {
    setMode(null);
    setFlashMsg({ type: "success", text: action === "add" ? "Item added successfully." : "Item updated successfully." });
    reloadMenu();
    setTimeout(() => setFlashMsg(null), 3500);
  };

  const handleDelete = async (item) => {
    await fetch(`${BASE_URL}/restaurants/${selectedId}/menu/${item.item_id}`, { method: "DELETE" });
    setDeleteConfirm(null);
    setFlashMsg({ type: "success", text: `"${item.item_name}" removed from menu.` });
    reloadMenu();
    setTimeout(() => setFlashMsg(null), 3500);
  };

  const selectedRestaurant = restaurants.find(r => String(r.restaurant_id) === selectedId);

  return (
    <div className="admin-shell">
      <nav className="admin-navbar">
        <span className="admin-navbar-brand">Grab<span>Hub</span></span>
        <span className="admin-navbar-pill">Restaurant Admin</span>
      </nav>

      <div className="admin-content">
        <div className="page-header">
          <h2 className="page-title">Menu Management</h2>
          <p className="page-sub">Add, edit, or remove items from your restaurant's menu</p>
        </div>

        {/* Restaurant Selector */}
        <div className="admin-restaurant-selector">
          <span className="admin-selector-label">Managing:</span>
          <select className="admin-select" value={selectedId}
            onChange={e => { setSelectedId(e.target.value); setFlashMsg(null); }}>
            {restaurants.map(r => (
              <option key={r.restaurant_id} value={r.restaurant_id}>{r.restaurant_name}</option>
            ))}
          </select>
        </div>

        {/* Flash message */}
        {flashMsg && <div className={`admin-form-msg ${flashMsg.type}`}>{flashMsg.text}</div>}

        {/* Menu list */}
        {!mode && (
          <>
            <div className="admin-menu-header">
              <h3 className="admin-menu-title">
                {selectedRestaurant?.restaurant_name} — Menu
                {!menuLoading && <span style={{ color: "var(--text-sub)", fontWeight: 500, fontSize: 14 }}> ({menu.length} items)</span>}
              </h3>
              <button className="btn-primary" onClick={() => setMode("add")}>+ Add Item</button>
            </div>

            {menuLoading && (
              <div className="loading-state">
                <div className="loading-spinner" />
                <span className="loading-text">Loading menu…</span>
              </div>
            )}

            {!menuLoading && menu.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">🍽️</div>
                <p className="empty-state-text">No items yet</p>
                <p className="empty-state-sub">Add your first menu item above.</p>
              </div>
            )}

            {!menuLoading && (
              <div className="admin-item-list">
                {menu.map(item => (
                  <div key={item.item_id} className="admin-item-row">
                    <div className="admin-item-info">
                      <div className="admin-item-name">{item.item_name}</div>
                      <div className="admin-item-meta">
                        <span>{item.category}</span>
                        {item.spice_level > 0 && <span>🌶️ {item.spice_level}/5</span>}
                        {item.is_vegetarian === 1 && <span>🥦 Veg</span>}
                        {item.is_available === 0 && <span style={{ color: "var(--danger)" }}>Unavailable</span>}
                      </div>
                    </div>
                    <span className="admin-item-price">${parseFloat(item.price).toFixed(2)}</span>
                    <div className="admin-item-actions">
                      <button className="btn-edit" onClick={() => setMode({ item })}>Edit</button>
                      {deleteConfirm === item.item_id ? (
                        <>
                          <button className="btn-danger" onClick={() => handleDelete(item)}>Confirm</button>
                          <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                        </>
                      ) : (
                        <button className="btn-danger" onClick={() => setDeleteConfirm(item.item_id)}>Remove</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Add form */}
        {mode === "add" && (
          <ItemForm
            restaurantId={selectedId}
            onSaved={() => handleSaved("add")}
            onCancel={() => setMode(null)}
          />
        )}

        {/* Edit form */}
        {mode?.item && (
          <ItemForm
            initial={{
              ...mode.item,
              is_vegetarian: !!mode.item.is_vegetarian,
              is_vegan: !!mode.item.is_vegan,
              is_gluten_free: !!mode.item.is_gluten_free,
              is_available: mode.item.is_available !== 0,
              calories: mode.item.calories ?? "",
            }}
            restaurantId={selectedId}
            onSaved={() => handleSaved("edit")}
            onCancel={() => setMode(null)}
          />
        )}
      </div>
    </div>
  );
}

const db = require('../config/db');

// List all customers (name + id only — for the switcher UI)
exports.getAllCustomers = async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT customer_id, first_name, last_name
      FROM Customer
      ORDER BY customer_id
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
};

// Get all orders for a customer
exports.getCustomerOrders = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT
        o.order_id,
        o.status,
        o.total_amount,
        o.order_type,
        r.restaurant_id,
        r.restaurant_name,
        a.street_name,
        a.city,
        a.state
      FROM \`Order\` o
      JOIN Restaurant r ON o.restaurant_id = r.restaurant_id
      JOIN Address a ON o.address_id = a.address_id
      WHERE o.customer_id = ?
      ORDER BY o.order_id DESC
    `, [id]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Get items for a specific order
exports.getOrderItems = async (req, res) => {
  const { orderId } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT
        oi.item_id,
        oi.quantity,
        oi.unit_price,
        m.item_name,
        m.category
      FROM Order_Item oi
      JOIN Menu_Item m ON oi.item_id = m.item_id
      WHERE oi.order_id = ?
    `, [orderId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching order items' });
  }
};

// Get customer by ID (excludes password_hash)
exports.getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT customer_id, first_name, last_name, email, phone, registration_date
      FROM Customer
      WHERE customer_id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching customer' });
  }
};

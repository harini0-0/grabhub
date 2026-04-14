const db = require('../config/db');

exports.getAllCustomers = async (_req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT customer_id, first_name, last_name FROM Customer ORDER BY customer_id'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT customer_id, first_name, last_name, email, phone, registration_date FROM Customer WHERE customer_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching customer' });
  }
};

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

exports.registerCustomer = async (req, res) => {
  const { first_name, last_name, email, phone, password } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Customer (first_name, last_name, email, phone, password_hash) VALUES (?, ?, ?, ?, SHA2(?, 256))',
      [first_name, last_name, email, phone, password]
    );
    res.status(201).json({ message: 'Customer registered', customer_id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already registered' });
    }
    console.error(error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.loginCustomer = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT customer_id, first_name, last_name, email, phone FROM Customer WHERE email = ? AND password_hash = SHA2(?, 256)',
      [email, password]
    );
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid email or password' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.updateCustomer = async (req, res) => {
  const { first_name, last_name, phone } = req.body;
  try {
    await db.query(
      'UPDATE Customer SET first_name = ?, last_name = ?, phone = ? WHERE customer_id = ?',
      [first_name, last_name, phone, req.params.id]
    );
    res.json({ message: 'Customer updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Update failed' });
  }
};

exports.deactivateCustomer = async (req, res) => {
  try {
    await db.query('DELETE FROM Customer WHERE customer_id = ?', [req.params.id]);
    res.json({ message: 'Customer removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Deletion failed' });
  }
};

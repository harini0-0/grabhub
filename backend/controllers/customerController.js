const db = require('../config/db');

// Get all active customers
exports.getAllCustomers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT customer_id, first_name, last_name, email, phone, registration_date FROM Customer WHERE is_active = TRUE'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching customers' });
  }
};

// Get customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT customer_id, first_name, last_name, email, phone, registration_date, is_active FROM Customer WHERE customer_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching customer' });
  }
};

// Register new customer
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

// Login
exports.loginCustomer = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT customer_id, first_name, last_name, email, phone FROM Customer WHERE email = ? AND password_hash = SHA2(?, 256) AND is_active = TRUE',
      [email, password]
    );
    if (rows.length === 0) return res.status(401).json({ message: 'Invalid email or password' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// Update customer profile
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

// Deactivate customer (soft delete)
exports.deactivateCustomer = async (req, res) => {
  try {
    await db.query(
      'UPDATE Customer SET is_active = FALSE WHERE customer_id = ?',
      [req.params.id]
    );
    res.json({ message: 'Customer deactivated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Deactivation failed' });
  }
};

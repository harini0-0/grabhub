const db = require('../config/db');

// Get all addresses for a customer
exports.getAddressesByCustomer = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Address WHERE customer_id = ? ORDER BY is_default DESC',
      [req.params.customerId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching addresses' });
  }
};

// Add new address
exports.addAddress = async (req, res) => {
  const { customer_id, street_number, street_name, apt_unit, city, state, zipcode, address_type, delivery_instructions, is_default } = req.body;
  try {
    // If setting as default, unset existing default first
    if (is_default) {
      await db.query('UPDATE Address SET is_default = FALSE WHERE customer_id = ?', [customer_id]);
    }
    const [result] = await db.query(
      `INSERT INTO Address (customer_id, street_number, street_name, apt_unit, city, state, zipcode, address_type, delivery_instructions, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer_id, street_number, street_name, apt_unit || null, city, state, zipcode, address_type, delivery_instructions || null, is_default || false]
    );
    res.status(201).json({ message: 'Address added', address_id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add address' });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  const { street_number, street_name, apt_unit, city, state, zipcode, address_type, delivery_instructions } = req.body;
  try {
    await db.query(
      `UPDATE Address SET street_number = ?, street_name = ?, apt_unit = ?, city = ?, state = ?, zipcode = ?, address_type = ?, delivery_instructions = ?
       WHERE address_id = ?`,
      [street_number, street_name, apt_unit || null, city, state, zipcode, address_type, delivery_instructions || null, req.params.id]
    );
    res.json({ message: 'Address updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Update failed' });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    await db.query('DELETE FROM Address WHERE address_id = ?', [req.params.id]);
    res.json({ message: 'Address deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Delete failed' });
  }
};

const db = require('../config/db');

exports.getBillingByCustomer = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, o.order_type, o.order_placed_at, r.restaurant_name
       FROM Billing b
       JOIN \`Order\` o ON b.order_id = o.order_id
       JOIN Restaurant r ON o.restaurant_id = r.restaurant_id
       WHERE o.customer_id = ?
       ORDER BY b.transaction_date DESC`,
      [req.params.customerId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching billing history' });
  }
};

exports.getBillingById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, o.order_type, o.order_placed_at, o.total_amount, r.restaurant_name
       FROM Billing b
       JOIN \`Order\` o ON b.order_id = o.order_id
       JOIN Restaurant r ON o.restaurant_id = r.restaurant_id
       WHERE b.billing_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Billing record not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching billing detail' });
  }
};

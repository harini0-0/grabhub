const db = require('../config/db');

// 🚴 Get all orders for delivery partner
exports.getDeliveryOrders = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        o.order_id,
        o.status,
        o.total_amount,
        o.order_type,
        r.restaurant_name,
        a.street_name,
        a.city,
        a.state
      FROM \`Order\` o
      JOIN Restaurant r ON o.restaurant_id = r.restaurant_id
      JOIN Address a ON o.address_id = a.address_id
      ORDER BY o.order_id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching delivery orders' });
  }
};
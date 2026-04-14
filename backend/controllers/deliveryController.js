const db = require('../config/db');

exports.getAllPartners = async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT partner_id, first_name, last_name, availability_status
      FROM Delivery_Partner
      ORDER BY partner_id
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching partners' });
  }
};

exports.getPartnerDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT partner_id, first_name, last_name, email, phone,
             availability_status, rating, date_joined
      FROM Delivery_Partner
      WHERE partner_id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching partner details' });
  }
};

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
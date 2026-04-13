const db = require('../config/db');

// Get order history for a customer
exports.getOrdersByCustomer = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT o.*, r.restaurant_name
       FROM \`Order\` o
       JOIN Restaurant r ON o.restaurant_id = r.restaurant_id
       WHERE o.customer_id = ?
       ORDER BY o.order_placed_at DESC`,
      [req.params.customerId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Get order detail with items and billing
exports.getOrderById = async (req, res) => {
  try {
    const [orderRows] = await db.query(
      `SELECT o.*, r.restaurant_name
       FROM \`Order\` o
       JOIN Restaurant r ON o.restaurant_id = r.restaurant_id
       WHERE o.order_id = ?`,
      [req.params.id]
    );
    if (orderRows.length === 0) return res.status(404).json({ message: 'Order not found' });

    const [items] = await db.query(
      `SELECT oi.*, mi.item_name
       FROM Order_Item oi
       JOIN Menu_Item mi ON oi.menu_item_id = mi.menu_item_id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );

    const [billing] = await db.query(
      'SELECT * FROM Billing WHERE order_id = ?',
      [req.params.id]
    );

    res.json({
      order: orderRows[0],
      items,
      billing: billing[0] || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching order details' });
  }
};

// Place order — calls the place_order stored procedure
exports.placeOrder = async (req, res) => {
  const {
    customer_id, restaurant_id, address_id, order_type,
    scheduled_time, party_size, special_instructions,
    items, delivery_fee, tip, payment_method, card_last_four
  } = req.body;

  try {
    // Build item list string: 'menu_item_id:qty:unit_price,...'
    let itemList = '';
    if (Array.isArray(items)) {
      itemList = items.map(i => `${i.menu_item_id}:${i.quantity}:${i.unit_price}`).join(',');
    } else if (typeof items === 'string') {
      itemList = items;
    }

    if (!itemList) {
      return res.status(400).json({ message: 'No items provided' });
    }

    // Call stored procedure with ? placeholders
    await db.query(
      'CALL place_order(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @new_order_id)',
      [
        customer_id, restaurant_id, address_id, order_type,
        scheduled_time || null, party_size || null,
        special_instructions || null, itemList,
        parseFloat(delivery_fee) || 0, parseFloat(tip) || 0,
        payment_method, card_last_four || null
      ]
    );

    const [result] = await db.query('SELECT @new_order_id AS order_id');
    res.status(201).json({ message: 'Order placed', order_id: result[0].order_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Failed to place order' });
  }
};

// Cancel order — calls the cancel_order stored procedure
exports.cancelOrder = async (req, res) => {
  try {
    await db.query('CALL cancel_order(?, @result_msg)', [req.params.id]);
    const [result] = await db.query('SELECT @result_msg AS msg');
    const msg = result[0].msg;

    if (msg.startsWith('Error')) {
      return res.status(400).json({ message: msg });
    }
    res.json({ message: msg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Cancellation failed' });
  }
};

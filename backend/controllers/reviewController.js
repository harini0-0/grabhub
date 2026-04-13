const db = require('../config/db');

// Get all reviews for a restaurant
exports.getRestaurantReviews = async (req, res) => {
  const { restaurantId } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT rr.review_id,
             rr.food_rating,
             rr.delivery_rating,
             rr.overall_rating,
             rr.comment,
             rr.review_date,
             rr.helpful_count,
             c.first_name,
             c.last_name
      FROM Review_Rating rr
      JOIN Customer c ON rr.customer_id = c.customer_id
      WHERE rr.restaurant_id = ?
      ORDER BY rr.review_date DESC
    `, [restaurantId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

// Add a review for a restaurant
exports.addReview = async (req, res) => {
  const { restaurant_id, food_rating, delivery_rating, overall_rating, comment } = req.body;
  const customer_id = 1; // hardcoded for demo (matches Profile/Recommendations)

  try {
    // Find the most recent order for this customer at this restaurant
    let [orders] = await db.query(`
      SELECT order_id FROM \`Order\`
      WHERE customer_id = ? AND restaurant_id = ?
      ORDER BY order_id DESC LIMIT 1
    `, [customer_id, restaurant_id]);

    // Fallback: any order for this customer (demo safety net)
    if (orders.length === 0) {
      [orders] = await db.query(`
        SELECT order_id FROM \`Order\`
        WHERE customer_id = ?
        ORDER BY order_id DESC LIMIT 1
      `, [customer_id]);
    }

    if (orders.length === 0) {
      return res.status(400).json({
        error: 'No orders found. Place an order before leaving a review.'
      });
    }

    const order_id = orders[0].order_id;

    // Prevent duplicate review for same order+restaurant
    const [existing] = await db.query(`
      SELECT review_id FROM Review_Rating
      WHERE order_id = ? AND customer_id = ? AND restaurant_id = ?
    `, [order_id, customer_id, restaurant_id]);

    if (existing.length > 0) {
      return res.status(409).json({ error: 'You have already reviewed this restaurant.' });
    }

    await db.query(`
      INSERT INTO Review_Rating
        (order_id, customer_id, restaurant_id, food_rating,
         delivery_rating, overall_rating, comment, review_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [order_id, customer_id, restaurant_id,
        food_rating, delivery_rating, overall_rating, comment || null]);

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting review' });
  }
};

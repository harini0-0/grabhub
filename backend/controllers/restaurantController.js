const db = require('../config/db');

// Get all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT restaurant_id, restaurant_name, city, state, average_rating
      FROM Restaurant
      WHERE is_active = TRUE
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching restaurants' });
  }
};

// Get menu
exports.getRestaurantMenu = async (req, res) => {
  const restaurantId = req.params.id;

  try {
    const [rows] = await db.query(`
      SELECT m.item_id, m.item_name, m.category, m.price, m.is_available, m.spice_level
      FROM Menu_Item m
      JOIN Restaurant_Menu_Item rmi 
        ON m.item_id = rmi.item_id
      WHERE rmi.restaurant_id = ?
    `, [restaurantId]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching menu' });
  }
};

// Get cuisine
exports.getRestaurantCuisine = async (req, res) => {
  const restaurantId = req.params.id;

  try {
    const [rows] = await db.query(
      `SELECT get_restaurant_cuisine(?) AS cuisines`,
      [restaurantId]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching cuisine' });
  }
};
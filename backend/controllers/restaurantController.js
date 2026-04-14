const db = require('../config/db');

// Get all restaurants
exports.getAllRestaurants = async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT restaurant_id, restaurant_name, city, state, average_rating
      FROM Restaurant
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching restaurants' });
  }
};

// Get menu for a restaurant
exports.getRestaurantMenu = async (req, res) => {
  const restaurantId = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT m.item_id, m.item_name, m.category, m.price,
             m.is_available, m.spice_level, m.is_vegetarian,
             m.is_vegan, m.is_gluten_free, m.calories, m.description
      FROM Menu_Item m
      JOIN Restaurant_Menu_Item rmi ON m.item_id = rmi.item_id
      WHERE rmi.restaurant_id = ?
    `, [restaurantId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching menu' });
  }
};

// Get cuisine for a restaurant
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

// Get operating hours for a restaurant
exports.getRestaurantHours = async (req, res) => {
  const restaurantId = req.params.id;
  try {
    const [rows] = await db.query(`
      SELECT day_of_week, opening_time, closing_time, is_closed
      FROM Restaurant_Hours
      WHERE restaurant_id = ?
      ORDER BY FIELD(day_of_week,
        'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')
    `, [restaurantId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching hours' });
  }
};

// ── Admin: add a new menu item to a restaurant ───────────────────────────────
exports.addMenuItemToRestaurant = async (req, res) => {
  const restaurantId = req.params.id;
  const {
    item_name, description, category, price,
    preparation_time, is_vegetarian, is_vegan,
    is_gluten_free, spice_level, calories, cuisine_id
  } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(`
      INSERT INTO Menu_Item
        (cuisine_id, item_name, description, category, price,
         preparation_time, is_available, is_vegetarian, is_vegan,
         is_gluten_free, spice_level, calories)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
    `, [
      cuisine_id || 1,
      item_name,
      description || '',
      category,
      price,
      preparation_time || 15,
      is_vegetarian ? 1 : 0,
      is_vegan ? 1 : 0,
      is_gluten_free ? 1 : 0,
      spice_level || 0,
      calories || null
    ]);

    const newItemId = result.insertId;
    await conn.query(
      `INSERT INTO Restaurant_Menu_Item (restaurant_id, item_id) VALUES (?, ?)`,
      [restaurantId, newItemId]
    );

    await conn.commit();
    res.status(201).json({ item_id: newItemId, message: 'Item added successfully' });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error adding menu item' });
  } finally {
    conn.release();
  }
};

// ── Admin: update an existing menu item ──────────────────────────────────────
exports.updateMenuItem = async (req, res) => {
  const { itemId } = req.params;
  const {
    item_name, description, category, price,
    preparation_time, is_vegetarian, is_vegan,
    is_gluten_free, spice_level, calories, is_available
  } = req.body;

  try {
    await db.query(`
      UPDATE Menu_Item
      SET item_name = ?, description = ?, category = ?, price = ?,
          preparation_time = ?, is_vegetarian = ?, is_vegan = ?,
          is_gluten_free = ?, spice_level = ?, calories = ?, is_available = ?
      WHERE item_id = ?
    `, [
      item_name,
      description || '',
      category,
      price,
      preparation_time || 15,
      is_vegetarian ? 1 : 0,
      is_vegan ? 1 : 0,
      is_gluten_free ? 1 : 0,
      spice_level || 0,
      calories || null,
      is_available === undefined ? 1 : (is_available ? 1 : 0),
      itemId
    ]);
    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating menu item' });
  }
};

// ── Admin: remove a menu item from a restaurant ───────────────────────────────
exports.removeMenuItemFromRestaurant = async (req, res) => {
  const { id: restaurantId, itemId } = req.params;
  try {
    await db.query(
      `DELETE FROM Restaurant_Menu_Item WHERE restaurant_id = ? AND item_id = ?`,
      [restaurantId, itemId]
    );
    res.json({ message: 'Item removed from restaurant' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing menu item' });
  }
};

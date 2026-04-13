const db = require('../config/db');

// ✅ Add favourite
exports.addFavourite = async (req, res) => {
  const { customer_id, restaurant_id, item_id } = req.body;

  try {
    await db.query(
      `INSERT INTO Favourites (customer_id, restaurant_id, item_id)
       VALUES (?, ?, ?)`,
      [customer_id, restaurant_id, item_id]
    );

    res.json({ message: 'Favourite added' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding favourite' });
  }
};

// ✅ Get favourites for customer
exports.getFavourites = async (req, res) => {
  const customerId = req.params.customerId;

  try {
    const [rows] = await db.query(`
      SELECT f.favourite_id, m.item_name, r.restaurant_name
      FROM Favourites f
      JOIN Menu_Item m ON f.item_id = m.item_id
      JOIN Restaurant r ON f.restaurant_id = r.restaurant_id
      WHERE f.customer_id = ?
    `, [customerId]);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching favourites' });
  }
};

// ✅ Delete favourite
exports.deleteFavourite = async (req, res) => {
  const favouriteId = req.params.id;

  try {
    await db.query(
      `DELETE FROM Favourites WHERE favourite_id = ?`,
      [favouriteId]
    );

    res.json({ message: 'Favourite removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting favourite' });
  }
};
const db = require('../config/db');
const { runKNN } = require('../services/knnService');

exports.generateProfile = async (req, res) => {
    const customerId = req.params.customerId;

    try {
        const [rows] = await db.query(`
      SELECT 
        AVG(m.spice_level) AS avg_spice,
        AVG(m.calories) AS avg_calories,
        m.cuisine_id
      FROM Order_Item oi
      JOIN Menu_Item m ON oi.item_id = m.item_id
      JOIN \`Order\` o ON oi.order_id = o.order_id
      WHERE o.customer_id = ?
      GROUP BY m.cuisine_id
      ORDER BY COUNT(*) DESC
      LIMIT 1
    `, [customerId]);

        if (rows.length === 0) {
            return res.json({ message: "No order data" });
        }

        const userData = {
            spice: Number(rows[0].avg_spice) || 2,
            calories: Number(rows[0].avg_calories) || 500,
            cuisine: Number(rows[0].cuisine_id) || 1
        };

        const result = await runKNN(userData);
        const { axis, category } = result;

        console.log("KNN Output:", axis, category);

        const [cat] = await db.query(`
      SELECT category_id FROM Profile_Category
      WHERE axis = ? AND category_name = ?
    `, [axis, category]);

        if (cat.length === 0) {
            return res.json({ message: "Category not found" });
        }

        const categoryId = cat[0].category_id;

        await db.query(`
        INSERT INTO Customer_Profile (customer_id, category_id, axis)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
            category_id = VALUES(category_id),
            assigned_at = CURRENT_TIMESTAMP`, [customerId, categoryId, axis]);

        res.json({
            customer_id: customerId,
            axis,
            category
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'KNN failed' });
    }
};

exports.getRecommendations = async (req, res) => {
  const customerId = req.params.customerId;

  try {
    const [profiles] = await db.query(`
      SELECT cp.axis, pc.category_name
      FROM Customer_Profile cp
      JOIN Profile_Category pc 
        ON cp.category_id = pc.category_id
      WHERE cp.customer_id = ?
    `, [customerId]);

    if (profiles.length === 0) {
      return res.json({ message: "Profile not generated" });
    }

    let spiceCondition = '';
    let healthCondition = '';

    profiles.forEach(p => {
      if (p.axis === 'Spice' && p.category_name === 'Spicy Enthusiast') {
        spiceCondition = 'm.spice_level >= 4';
      }

      if (p.axis === 'Health' && p.category_name === 'Health Conscious') {
        healthCondition = 'm.calories <= 500';
      }
    });

    let conditions = [];
    if (spiceCondition) conditions.push(spiceCondition);
    if (healthCondition) conditions.push(healthCondition);

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [items] = await db.query(`
      SELECT DISTINCT m.item_id, m.item_name, m.price, m.spice_level, m.calories
      FROM Menu_Item m
      JOIN Restaurant_Menu_Item rmi 
        ON m.item_id = rmi.item_id
      ${whereClause}
      LIMIT 10
    `);

    res.json({
      profiles,
      recommendations: items
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Recommendation failed' });
  }
};
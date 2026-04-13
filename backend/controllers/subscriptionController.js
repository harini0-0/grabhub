const db = require('../config/db');

// Get subscriptions for a customer
exports.getSubscriptionsByCustomer = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Subscription WHERE customer_id = ? ORDER BY start_date DESC',
      [req.params.customerId]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching subscriptions' });
  }
};

// Subscribe to GrabHub+
exports.createSubscription = async (req, res) => {
  const { customer_id, plan_type } = req.body;

  // Calculate dates and fee
  const startDate = new Date().toISOString().split('T')[0];
  let endDate, fee;
  if (plan_type === 'Annual') {
    const end = new Date();
    end.setFullYear(end.getFullYear() + 1);
    endDate = end.toISOString().split('T')[0];
    fee = 7.99;
  } else {
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    endDate = end.toISOString().split('T')[0];
    fee = 9.99;
  }

  try {
    // Check for existing active subscription
    const [existing] = await db.query(
      "SELECT * FROM Subscription WHERE customer_id = ? AND status = 'Active'",
      [customer_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Already have an active subscription' });
    }

    const [result] = await db.query(
      "INSERT INTO Subscription (customer_id, plan_type, start_date, end_date, status, auto_renew, monthly_fee) VALUES (?, ?, ?, ?, 'Active', TRUE, ?)",
      [customer_id, plan_type, startDate, endDate, fee]
    );
    res.status(201).json({ message: 'Subscribed successfully', subscription_id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Subscription failed' });
  }
};

// Toggle auto-renew
exports.toggleAutoRenew = async (req, res) => {
  try {
    await db.query(
      'UPDATE Subscription SET auto_renew = NOT auto_renew WHERE subscription_id = ?',
      [req.params.id]
    );
    res.json({ message: 'Auto-renew toggled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Update failed' });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    await db.query(
      "UPDATE Subscription SET status = 'Cancelled', auto_renew = FALSE WHERE subscription_id = ?",
      [req.params.id]
    );
    res.json({ message: 'Subscription cancelled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Cancellation failed' });
  }
};

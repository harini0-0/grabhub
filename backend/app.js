const express = require('express');
const cors = require('cors');

const restaurantRoutes = require('./routes/restaurantRoutes');
const favouritesRoutes = require('./routes/favouritesRoutes');
const profileRoutes = require('./routes/profileRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');

const customerRoutes = require('./routes/customerRoutes');
const addressRoutes = require('./routes/addressRoutes');
const orderRoutes = require('./routes/orderRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const billingRoutes = require('./routes/billingRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('GrabHub Backend Running');
});

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/favourites', favouritesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/delivery', deliveryRoutes);

app.use('/api/customers', customerRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/billing', billingRoutes);

module.exports = app;

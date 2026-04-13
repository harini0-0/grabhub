const express = require('express');
const cors = require('cors');

const restaurantRoutes = require('./routes/restaurantRoutes');
const favouritesRoutes = require('./routes/favouritesRoutes');
const profileRoutes = require('./routes/profileRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('GrabHub Backend Running');
});

// Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/favourites', favouritesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/reviews',    reviewRoutes);
app.use('/api/customers', customerRoutes);

module.exports = app;
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = require('./app');

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
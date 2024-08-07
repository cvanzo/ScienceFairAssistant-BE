const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/apiRoutes');

// Initialize Express app
const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up API routes
app.use('/api', apiRoutes);

module.exports = app;

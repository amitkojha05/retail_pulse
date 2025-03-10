const express = require('express');
const bodyParser = require('body-parser');
const jobRoutes = require('../routes/jobRoutes');

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use(jobRoutes);

// Not found handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;

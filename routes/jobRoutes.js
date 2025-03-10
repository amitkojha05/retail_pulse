const express = require('express');
const jobController = require('../controllers/jobController');
const storeService = require('../services/storeService');

const router = express.Router();

// Submit a new job
router.post('/api/submit', jobController.submitJob);

// Get job status
router.get('/api/status', jobController.getJobStatus);

// Simple status endpoint for testing
router.get('/api/health', (req, res) => {
    const storeCount = Object.keys(storeService.stores).length;
    res.status(200).json({
        status: 'ok',
        message: 'Service is running',
        stores_loaded: storeCount,
        sample_stores: Object.keys(storeService.stores).slice(0, 3)
    });
});

module.exports = router;

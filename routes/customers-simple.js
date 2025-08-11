const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const checkSubscription = require('../middleware/checkSubscription');

// Test route only
router.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Customer routes working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

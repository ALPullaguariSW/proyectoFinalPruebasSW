const express = require('express');
const router = express.Router();

// Health check endpoint for Render
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Plataforma Reservas Backend',
    version: '1.0.0'
  });
});

module.exports = router;

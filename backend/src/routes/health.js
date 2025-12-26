const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'street-eye-backend' });
});

module.exports = router;



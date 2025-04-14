const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

// Dummy protected route
router.get('/protected', auth, (req, res) => {
  res.json({ message: `Welcome, user ${req.user.id}! 🔐` });
});

module.exports = router;

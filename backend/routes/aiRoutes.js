const express = require('express');
const router = express.Router();
const { recommendEmployee } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// Secure all AI endpoints with JWT authentication
router.use(protect);

router.post('/recommend', recommendEmployee);

module.exports = router;

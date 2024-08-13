const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const { hasRole } = require('../../middleware/roleMiddleware');
const adminController = require('../../controllers/adminController');

const router = express.Router();

router.put('/roles', protect, hasRole('admin'), adminController.updateRole);

module.exports = router;
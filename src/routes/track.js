const express = require('express');
const { trackOrder } = require('../controller/trackController');
const router = express.Router();

router.get('/:orderId', trackOrder);

module.exports = router;

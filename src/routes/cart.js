const express = require('express');
const { getCart, addCartItem, updateCartItem, removeCartItem } = require('../controller/cartController');
const router = express.Router();

router.get('/', getCart);
router.post('/', addCartItem);
router.put('/', updateCartItem);
router.delete('/:cartItemId', removeCartItem);

module.exports = router;

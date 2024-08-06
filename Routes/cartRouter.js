const express = require('express');
const router = express.Router();
const cartController = require('../Controllers/cartController');

router.post('/add', cartController.addToCart);
router.post('/remove', cartController.removeFromCart);
router.get('/items/:userId', cartController.getCartItems);

module.exports = router;

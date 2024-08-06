const express = require('express');
const router = express.Router();
const productController = require('../Controllers/productController');

router.route('/')
    .post(productController.addProduct)
    .get(productController.getProducts);

    router.route('/category/:categoryId')
    .get(productController.getProductsByCategoryId);

module.exports = router;

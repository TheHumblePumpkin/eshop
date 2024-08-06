const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.route('/')
    .post(categoryController.addCategory)
    .get(categoryController.getCategories);  

module.exports = router;

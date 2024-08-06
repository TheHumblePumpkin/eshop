const Product = require('../Models/productSchema');
const Category = require('../Models/categorySchema');

exports.addProduct = async (req, res) => {
    try {
        const { name, description, image, images, brand, price, category, countInStock, rating, numReviews, isFeatured } = req.body;

        const categoryDoc = await Category.findOne({ name: category });
        if (!categoryDoc) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category name'
            });
        }

        const product = new Product({
            name,
            description,
            image,
            images,
            brand,
            price,
            category: categoryDoc._id,
            countInStock,
            rating,
            numReviews,
            isFeatured
        });

        const savedProduct = await product.save();
        res.status(201).json({
            success: true,
            data: savedProduct
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

//Get all products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('category');
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProductsByCategoryId = async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const products = await Product.find({ category: category._id }).populate('category');

        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

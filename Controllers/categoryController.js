const Category = require('../Models/categorySchema');

// @desc    Add a category
exports.addCategory = async (req, res) => {
    try {
        const { name, icon } = req.body;

        // Check if the name is one of the allowed values
        const allowedNames = ['Games', 'Books', 'Cosmetics', 'Grocery', 'Other'];
        if (!allowedNames.includes(name)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category name. Allowed names are: ${allowedNames.join(', ')}`
            });
        }

        const category = new Category({ name, icon });
        const savedCategory = await category.save();

        res.status(201).json({
            success: true,
            data: savedCategory
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
